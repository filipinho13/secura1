import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, UserCheck, UserX, Shield, User, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

const UsersPage = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const { hasRole } = useAuth()
  const queryClient = useQueryClient()

  // Mock users query - replace with actual API call when available
  const { data: users, isLoading } = useQuery('users', async () => {
    // This would be replaced with actual API call
    return [
      {
        id: '1',
        email: 'admin@secura.com',
        first_name: 'Admin',
        last_name: 'System',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01',
        last_login: '2024-01-15'
      },
      {
        id: '2',
        email: 'commercial@secura.com',
        first_name: 'Jean',
        last_name: 'Dupont',
        role: 'commercial',
        is_active: true,
        created_at: '2024-01-02',
        last_login: '2024-01-14'
      },
      {
        id: '3',
        email: 'tech@secura.com',
        first_name: 'Marie',
        last_name: 'Martin',
        role: 'technicien',
        is_active: true,
        created_at: '2024-01-03',
        last_login: '2024-01-13'
      }
    ]
  })

  const createMutation = useMutation(authService.register, {
    onSuccess: () => {
      queryClient.invalidateQueries('users')
      setShowModal(false)
      toast.success('Utilisateur créé avec succès')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création')
    }
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-red-500" />
      case 'commercial':
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case 'technicien':
        return <User className="h-5 w-5 text-green-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { color: 'bg-red-100 text-red-800', text: 'Administrateur' },
      'commercial': { color: 'bg-blue-100 text-blue-800', text: 'Commercial' },
      'technicien': { color: 'bg-green-100 text-green-800', text: 'Technicien' }
    }
    
    const config = roleConfig[role] || roleConfig['technicien']
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900">Accès restreint</h2>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600">Gestion des comptes utilisateurs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.is_active ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-800">Actif</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-800">Inactif</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isLoading}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => {
            // Handle edit
            console.log('Edit user:', data)
            setEditingUser(null)
            toast.success('Utilisateur modifié')
          }}
          loading={false}
        />
      )}
    </div>
  )
}

const UserModal = ({ user, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'technicien'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="input mt-1"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="input mt-1"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  className="input mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                className="input mt-1"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="technicien">Technicien</option>
                <option value="commercial">Commercial</option>
                <option value="admin">Administrateur</option>
              </select>
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
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UsersPage