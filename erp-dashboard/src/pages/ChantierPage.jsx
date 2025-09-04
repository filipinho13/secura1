import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { chantierService, clientService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Eye, MapPin, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const ChantierPage = () => {
  const [selectedChantier, setSelectedChantier] = useState(null)
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()

  const { data: chantiers, isLoading } = useQuery('chantiers', chantierService.getAll)
  const { data: clients } = useQuery('clients', clientService.getAll)

  const updateMutation = useMutation(
    ({ id, data }) => chantierService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('chantiers')
        toast.success('Chantier mis à jour')
      }
    }
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      'planifié': { color: 'bg-blue-100 text-blue-800', text: 'Planifié' },
      'en_cours': { color: 'bg-yellow-100 text-yellow-800', text: 'En cours' },
      'terminé': { color: 'bg-green-100 text-green-800', text: 'Terminé' },
      'annulé': { color: 'bg-red-100 text-red-800', text: 'Annulé' }
    }
    
    const config = statusConfig[status] || statusConfig['planifié']
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getProgressColor = (progression) => {
    if (progression < 30) return 'bg-red-500'
    if (progression < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chantiers</h1>
          <p className="text-gray-600">
            {hasRole('technicien') ? 'Mes chantiers assignés' : 'Gestion des chantiers'}
          </p>
        </div>
      </div>

      {/* Chantiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chantiers?.map((chantier) => {
          const client = clients?.find(c => c.id === chantier.client_id)
          return (
            <div key={chantier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{chantier.titre}</h3>
                    <p className="text-sm text-gray-600">{chantier.numero}</p>
                  </div>
                  {getStatusBadge(chantier.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{chantier.adresse_chantier}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(chantier.date_debut_prevue).toLocaleDateString('fr-FR')} - 
                      {new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium">{chantier.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(chantier.progression)}`}
                      style={{ width: `${chantier.progression}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedChantier(chantier)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir détails
                  </button>
                  
                  {hasRole(['admin', 'commercial', 'technicien']) && (
                    <div className="flex space-x-2">
                      <button className="text-gray-600 hover:text-gray-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chantier Detail Modal */}
      {selectedChantier && (
        <ChantierDetailModal
          chantier={selectedChantier}
          client={clients?.find(c => c.id === selectedChantier.client_id)}
          onClose={() => setSelectedChantier(null)}
          onUpdate={(data) => {
            updateMutation.mutate({ id: selectedChantier.id, data })
            setSelectedChantier(null)
          }}
          canUpdate={hasRole(['admin', 'commercial', 'technicien'])}
        />
      )}
    </div>
  )
}

const ChantierDetailModal = ({ chantier, client, onClose, onUpdate, canUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    status: chantier.status,
    progression: chantier.progression,
    notes: chantier.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Détails du chantier</h3>
            <div className="flex space-x-2">
              {canUpdate && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn btn-secondary text-sm"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  className="input mt-1"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="planifié">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Progression ({formData.progression}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full mt-2"
                  value={formData.progression}
                  onChange={(e) => setFormData({...formData, progression: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="input mt-1 h-24"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Ajouter des notes sur l'avancement..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Informations générales</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="font-medium">Numéro:</span> {chantier.numero}</p>
                    <p><span className="font-medium">Titre:</span> {chantier.titre}</p>
                    <p><span className="font-medium">Client:</span> {client ? `${client.prenom} ${client.nom}` : 'Inconnu'}</p>
                    <p><span className="font-medium">Adresse:</span> {chantier.adresse_chantier}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Planning</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="font-medium">Début prévu:</span> {new Date(chantier.date_debut_prevue).toLocaleDateString('fr-FR')}</p>
                    <p><span className="font-medium">Fin prévue:</span> {new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
                    {chantier.date_debut_reelle && (
                      <p><span className="font-medium">Début réel:</span> {new Date(chantier.date_debut_reelle).toLocaleDateString('fr-FR')}</p>
                    )}
                    {chantier.date_fin_reelle && (
                      <p><span className="font-medium">Fin réelle:</span> {new Date(chantier.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="mt-2 text-sm text-gray-600">{chantier.description}</p>
              </div>
              
              {chantier.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="mt-2 text-sm text-gray-600">{chantier.notes}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">Progression</h4>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avancement</span>
                    <span>{chantier.progression}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${chantier.progression}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChantierPage