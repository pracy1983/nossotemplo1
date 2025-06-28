import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Dashboard from './Dashboard';
import StudentList from './StudentList';
import AddStudent from './AddStudent';
import ManageAdmins from './ManageAdmins';
import Events from './Events';
import AttendanceMarker from './AttendanceMarker';
import Statistics from './Statistics';
import Temples from './Temples';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavigateToAddStudent = () => {
    setActiveTab('add-student');
  };

  const handleNavigateToStudentList = () => {
    setActiveTab('students');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentList onNavigateToAddStudent={handleNavigateToAddStudent} />;
      case 'add-student':
        return <AddStudent onNavigateToList={handleNavigateToStudentList} />;
      case 'manage-admins':
        return <ManageAdmins />;
      case 'temples':
        return <Temples />;
      case 'events':
        return <Events />;
      case 'attendance':
        return <AttendanceMarker />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;