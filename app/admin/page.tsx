import { FileText, Users, Eye, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  // TODO: Fetch real stats from database
  const stats = [
    {
      label: 'Total Pages',
      value: '48',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Active Users',
      value: '1,234',
      change: '+23%',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Page Views',
      value: '45.2K',
      change: '+18%',
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'SEO Score',
      value: '92/100',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">
          Welcome to the ChatGPT Philippines Admin Panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Page updated', page: 'Paraphraser', time: '2 minutes ago' },
            { action: 'SEO optimized', page: 'Chat', time: '1 hour ago' },
            { action: 'New FAQ added', page: 'Translator', time: '3 hours ago' },
            { action: 'Media uploaded', page: 'Homepage', time: '5 hours ago' },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div>
                <div className="font-medium text-neutral-900">{activity.action}</div>
                <div className="text-sm text-neutral-600">{activity.page}</div>
              </div>
              <div className="text-sm text-neutral-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Create New Page</h3>
          <p className="text-orange-100 mb-4">
            Add a new page to your website with our page builder
          </p>
          <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
            Get Started
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">SEO Optimization</h3>
          <p className="text-purple-100 mb-4">
            Improve your SEO scores with our optimization tools
          </p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
            Optimize Now
          </button>
        </div>
      </div>
    </div>
  );
}
