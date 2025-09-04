import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { interventionService, chantierService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Clock, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const InterventionsPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedIntervention, setSelectedIntervention] = useState(null)
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()

  const { data: interventions, isLoading } = useQuery('interventions', interventionService.getAll)
  const { data: chantiers } = useQuery('chantiers', chantierService.getAll)

  const createMutation = useMutation(interventionService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('interventions')
      setShowModal(false)
      toast.success('Intervention créée avec succès')
    }
  })

  const updateMutation = useMutation(
    ({ id, data }) => interventionService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('interventions')
        setSelectedIntervention(null)
        toast.success('Intervention mise à jour')
      }
    }
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'programmée':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'en_cours':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'terminée':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'reportée':
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'programmée': { color: 'bg-blue-100 text-blue-800', text: 'Programmée' },
      'en_cours': { color: 'bg-orange-100 text-orange-800', text: 'En cours' },
      'terminée': { color: 'bg-green-100 text-green-800', text: 'Terminée' },
      'reportée': { color: 'bg-red-100 text-red-800', text: 'Reportée' }
    }
    
    const config = statusConfig[status] || statusConfig['programmée']
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
          <p className="text-gray-600">
            {hasRole('technicien') ? 'Mes interventions' : 'Gestion des interventions'}
          </p>
        </div>
        {hasRole(['admin', 'technicien']) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle Intervention</span>
          </button>
        )}
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {interventions?.map((intervention) => {
          const chantier = chantiers?.find(c => c.id === intervention.chantier_id)
          return (
            <div key={intervention.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(intervention.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{intervention.titre}</h3>
                    <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                    
                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(intervention.date_intervention).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Chantier:</span> {chantier?.titre || 'Inconnu'}
                      </div>
                      <div>
                        <span className="font-medium">Durée prévue:</span> {intervention.duree_prevue} min
                      </div>
                      {intervention.duree_reelle && (
                        <div>
                          <span className="font-medium">Durée réelle:</span> {intervention.duree_reelle} min
                        </div>
                      )}
                    </div>

                    {intervention.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {intervention.notes}
                        </p>
                      </div>
                    )}

                    {intervention.photos && intervention.photos.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {intervention.photos.length} photo(s) attachée(s)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(intervention.status)}
                  <button
                    onClick={() => setSelectedIntervention(intervention)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Intervention Modal */}
      {showModal && (
        <InterventionModal
          chantiers={chantiers}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isLoading}
        />
      )}

      {/* Update Intervention Modal */}
      {selectedIntervention && (
        <UpdateInterventionModal
          intervention={selectedIntervention}
          onClose={() => setSelectedIntervention(null)}
          onSubmit={(data) => updateMutation.mutate({ id: selectedIntervention.id, data })}
          loading={updateMutation.isLoading}
        />
      )}
    </div>
  )
}

const InterventionModal = ({ chantiers, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    chantier_id: '',
    titre: '',
    description: '',
    date_intervention: '',
    duree_prevue: 120
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle intervention</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chantier</label>
            <select
              className="input mt-1"
              value={formData.chantier_id}
              onChange={(e) => setFormData({...formData, chantier_id: e.target.value})}
              required
            >
              <option value="">Sélectionner un chantier</option>
              {chantiers?.map(chantier => (
                <option key={chantier.id} value={chantier.id}>
                  {chantier.numero} - {chantier.titre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              className="input mt-1"
              value={formData.titre}
              onChange={(e) => setFormData({...formData, titre: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="input mt-1 h-20"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'intervention</label>
              <input
                type="datetime-local"
                className="input mt-1"
                value={formData.date_intervention}
                onChange={(e) => setFormData({...formData, date_intervention: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Durée prévue (min)</label>
              <input
                type="number"
                className="input mt-1"
                value={formData.duree_prevue}
                onChange={(e) => setFormData({...formData, duree_prevue: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const UpdateInterventionModal = ({ intervention, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    status: intervention.status,
    duree_reelle: intervention.duree_reelle || '',
    notes: intervention.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const updateData = { ...formData }
    if (updateData.duree_reelle) {
      updateData.duree_reelle = parseInt(updateData.duree_reelle)
    }
    onSubmit(updateData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mettre à jour l'intervention</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium">{intervention.titre}</h4>
          <p className="text-sm text-gray-600">{intervention.description}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              className="input mt-1"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="programmée">Programmée</option>
              <option value="en_cours">En cours</option>
              <option value="terminée">Terminée</option>
              <option value="reportée">Reportée</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Durée réelle (minutes)
            </label>
            <input
              type="number"
              className="input mt-1"
              value={formData.duree_reelle}
              onChange={(e) => setFormData({...formData, duree_reelle: e.target.value})}
              placeholder={`Durée prévue: ${intervention.duree_prevue} min`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="input mt-1 h-24"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Ajouter des notes sur l'intervention..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InterventionsPage