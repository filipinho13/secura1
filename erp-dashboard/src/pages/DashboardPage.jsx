import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/api'
import {
  Users,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const DashboardPage = () => {
  const { user, hasRole } = useAuth()
  const { data: stats, isLoading } = useQuery('dashboard-stats', dashboardService.getStats)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getStatsCards = () => {
    if (!stats) return []

    if (hasRole('admin')) {
      return [
        {
          title: 'Total Clients',
          value: stats.total_clients,
          icon: Users,
          color: 'bg-blue-500',
          trend: '+12%'
        },
        {
          title: 'Devis Acceptés',
          value: `${stats.devis_acceptes}/${stats.total_devis}`,
          icon: CheckCircle,
          color: 'bg-green-500',
          trend: '+8%'
        },
        {
          title: 'Chantiers Actifs',
          value: stats.chantiers_actifs,
          icon: Building2,
          color: 'bg-orange-500',
          trend: '+5%'
        },
        {
          title: 'Interventions Programmées',
          value: stats.interventions_programmees,
          icon: Clock,
          color: 'bg-purple-500',
          trend: '+15%'
        }
      ]
    }

    if (hasRole('commercial')) {
      return [
        {
          title: 'Mes Clients',
          value: stats.mes_clients,
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: 'Mes Devis',
          value: stats.mes_devis,
          icon: FileText,
          color: 'bg-indigo-500'
        },
        {
          title: 'Devis Acceptés',
          value: stats.devis_acceptes,
          icon: CheckCircle,
          color: 'bg-green-500'
        },
        {
          title: 'Mes Chantiers',
          value: stats.mes_chantiers,
          icon: Building2,
          color: 'bg-orange-500'
        }
      ]
    }

    if (hasRole('technicien')) {
      return [
        {
          title: 'Mes Chantiers',
          value: stats.mes_chantiers,
          icon: Building2,
          color: 'bg-blue-500'
        },
        {
          title: 'Chantiers Actifs',
          value: stats.chantiers_actifs,
          icon: TrendingUp,
          color: 'bg-green-500'
        },
        {
          title: 'Mes Interventions',
          value: stats.mes_interventions,
          icon: Clock,
          color: 'bg-orange-500'
        },
        {
          title: 'Interventions Programmées',
          value: stats.interventions_programmees,
          icon: AlertCircle,
          color: 'bg-red-500'
        }
      ]
    }

    return []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statsCards = getStatsCards()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                {card.trend && (
                  <p className="text-sm text-green-600">{card.trend} ce mois</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasRole(['admin', 'commercial']) && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium">Nouveau Client</h3>
                <p className="text-sm text-gray-600">Ajouter un nouveau client</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium">Créer Devis</h3>
                <p className="text-sm text-gray-600">Nouveau devis client</p>
              </button>
            </>
          )}
          {hasRole(['admin', 'technicien']) && (
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Clock className="h-8 w-8 text-orange-500 mb-2" />
              <h3 className="font-medium">Nouvelle Intervention</h3>
              <p className="text-sm text-gray-600">Programmer une intervention</p>
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Devis DEV000123 accepté</p>
              <p className="text-xs text-gray-500">Il y a 2 heures</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nouveau chantier créé</p>
              <p className="text-xs text-gray-500">Il y a 4 heures</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Intervention programmée</p>
              <p className="text-xs text-gray-500">Il y a 6 heures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage