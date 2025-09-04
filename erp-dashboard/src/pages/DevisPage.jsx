import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { devisService, clientService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Eye, FileText, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

const DevisPage = () => {
  const [showModal, setShowModal] = useState(false)
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()

  const { data: devis, isLoading } = useQuery('devis', devisService.getAll)
  const { data: clients } = useQuery('clients', clientService.getAll)

  const createMutation = useMutation(devisService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('devis')
      setShowModal(false)
      toast.success('Devis créé avec succès')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création')
    }
  })

  const updateStatusMutation = useMutation(
    ({ id, status }) => devisService.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devis')
        toast.success('Statut mis à jour')
      }
    }
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      'brouillon': { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      'envoyé': { color: 'bg-blue-100 text-blue-800', text: 'Envoyé' },
      'accepté': { color: 'bg-green-100 text-green-800', text: 'Accepté' },
      'refusé': { color: 'bg-red-100 text-red-800', text: 'Refusé' },
      'expiré': { color: 'bg-orange-100 text-orange-800', text: 'Expiré' }
    }
    
    const config = statusConfig[status] || statusConfig['brouillon']
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
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600">Gestion des devis clients</p>
        </div>
        {hasRole(['admin', 'commercial']) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau Devis</span>
          </button>
        )}
      </div>

      {/* Devis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devis?.map((devisItem) => {
                const client = clients?.find(c => c.id === devisItem.client_id)
                return (
                  <tr key={devisItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {devisItem.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client ? `${client.prenom} ${client.nom}` : 'Client inconnu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client?.entreprise}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{devisItem.titre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {devisItem.total_ttc.toLocaleString('fr-FR')} €
                      </div>
                      <div className="text-sm text-gray-500">
                        HT: {devisItem.total_ht.toLocaleString('fr-FR')} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(devisItem.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(devisItem.date_creation).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        {hasRole(['admin', 'commercial']) && devisItem.status === 'brouillon' && (
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {hasRole(['admin', 'commercial']) && devisItem.status === 'envoyé' && (
                          <>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: devisItem.id, status: 'accepté' })}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: devisItem.id, status: 'refusé' })}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Devis Modal */}
      {showModal && (
        <DevisModal
          clients={clients}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isLoading}
        />
      )}
    </div>
  )
}

const DevisModal = ({ clients, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    titre: '',
    description: '',
    date_validite: '',
    notes: '',
    items: [{ description: '', quantite: 1, prix_unitaire: 0, total: 0 }]
  })

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantite: 1, prix_unitaire: 0, total: 0 }]
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    
    if (field === 'quantite' || field === 'prix_unitaire') {
      newItems[index].total = newItems[index].quantite * newItems[index].prix_unitaire
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveau devis</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  className="input mt-1"
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients?.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.prenom} {client.nom} - {client.entreprise}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de validité</label>
                <input
                  type="date"
                  className="input mt-1"
                  value={formData.date_validite}
                  onChange={(e) => setFormData({...formData, date_validite: e.target.value})}
                  required
                />
              </div>
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

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Articles</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-secondary text-sm"
                >
                  Ajouter un article
                </button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      className="input"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qté"
                      className="input"
                      value={item.quantite}
                      onChange={(e) => updateItem(index, 'quantite', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Prix unit."
                      className="input"
                      value={item.prix_unitaire}
                      onChange={(e) => updateItem(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="input bg-gray-50"
                      value={item.total}
                      readOnly
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn btn-danger w-full"
                      disabled={formData.items.length === 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="input mt-1"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Création...' : 'Créer le devis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DevisPage