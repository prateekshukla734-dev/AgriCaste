import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { farmAPI } from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';
import { Plus, Building2, BarChart3, MapPin, Lock, Calendar, Zap, ChevronRight, Sprout } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: farms, isLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: farmAPI.list,
  });

  const totalArea = Array.isArray(farms) ? farms.reduce((sum, farm) => sum + (farm.area || 0), 0) : 0;
  const avgArea = Array.isArray(farms) && farms.length > 0 ? (totalArea / farms.length).toFixed(1) : 0;

  // Handle voice assistant actions
  const handleVoiceAction = (action) => {
    switch (action) {
      case 'weather':
      case 'recommendations':
        navigate('/recommendations');
        break;
      case 'market':
        navigate('/market');
        break;
      case 'add-farm':
        navigate('/farms/new');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your farms and get AI-powered recommendations
            </p>
          </div>
          <Link
            to="/farms/new"
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3" />
            <span>Add Farm</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={<Building2 className="w-3 h-3" />}
          title="Total Farms"
          value={Array.isArray(farms) ? farms.length : 0}
          subtitle="Active farms"
          color="bg-green-500"
        />
        
        <StatsCard
          icon={<MapPin className="w-3 h-3" />}
          title="Total Area"
          value={`${totalArea.toFixed(1)} ha`}
          subtitle="Under cultivation"
          color="bg-blue-500"
        />
        
        <StatsCard
          icon={<BarChart3 className="w-3 h-3" />}
          title="Avg Farm Size"
          value={`${avgArea} ha`}
          subtitle="Per farm"
          color="bg-purple-500"
        />
        
        <StatsCard
          icon={<Zap className="w-3 h-3" />}
          title="AI Insights"
          value="Ready"
          subtitle="Get recommendations"
          color="bg-orange-500"
          isAction={true}
          actionLink="/recommendations"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <ActionCard
                to="/farms/new"
                icon={<Plus className="w-3 h-3" />}
                title="Add New Farm"
                description="Register a new farm location"
                color="bg-green-500"
              />
              
              <ActionCard
                to="/recommendations"
                icon={<Zap className="w-3 h-3" />}
                title="AI Recommendations"
                description="Get Agricast suggestions"
                color="bg-blue-500"
              />
              
              <ActionCard
                to="/market"
                icon={<BarChart3 className="w-3 h-3" />}
                title="Market Insights"
                description="Check current prices"
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Farms List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Farms ({Array.isArray(farms) ? farms.length : 0})
              </h2>
            </div>
            
            <div className="p-6">
              {Array.isArray(farms) && farms.length > 0 ? (
                <div className="space-y-4">
                  {farms.map((farm) => (
                    <FarmCard key={farm._id} farm={farm} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No farms yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first farm to get personalized recommendations</p>
                  <Link
                    to="/farms/new"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Your First Farm
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice Assistant */}
      <VoiceAssistant farms={farms} onVoiceAction={handleVoiceAction} />
    </div>
  );
}

// Stats Card Component
const StatsCard = ({ icon, title, value, subtitle, color, isAction, actionLink }) => {
  const CardContent = () => (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 sm:p-4 ${isAction ? 'hover:border-gray-300 hover:shadow-md cursor-pointer' : ''} transition-all duration-200`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${color} rounded-lg flex items-center justify-center text-white`}>
              {icon}
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {isAction && (
          <div className="text-gray-400 self-end sm:self-center mt-2 sm:mt-0">
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );

  return isAction ? (
    <Link to={actionLink}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

// Action Card Component
const ActionCard = ({ to, icon, title, description, color }) => (
  <Link
    to={to}
    className="group flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
  >
    <div className={`w-7 h-7 sm:w-8 sm:h-8 ${color} rounded-md flex items-center justify-center text-white mr-3`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
  </Link>
);

// Farm Card Component
const FarmCard = ({ farm }) => (
  <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
      <div className="mb-3 sm:mb-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{farm.name}</h3>
        <p className="text-sm text-gray-600">{farm.location}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
          {farm.area} ha
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
          {farm.irrigationType}
        </span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 mb-3 sm:mb-4">
      <div className="flex items-center space-x-2">
        <MapPin className="w-3 h-3 text-gray-400" />
        <span className="truncate">Lat: {farm.latitude}, Lng: {farm.longitude}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Lock className="w-3 h-3 text-gray-400" />
        <span>Soil: {farm.soilType}</span>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
      <div className="text-xs text-gray-500">
        <Calendar className="w-3 h-3 inline mr-1" />
        Added {new Date(farm.createdAt).toLocaleDateString()}
      </div>
      <Link
        to={`/recommendations?farmId=${farm._id}`}
        className="flex items-center justify-center sm:justify-start space-x-1 text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200 px-3 py-1 rounded-md bg-green-50 hover:bg-green-100"
      >
        <span>Get Recommendations</span>
        <Zap className="w-3 h-3" />
      </Link>
    </div>
  </div>
);

