import React from 'react';
import RegisteredPartiesPage from '../../../../pages/RegisteredPartiesPage';

export default function PartyDashboardPage(props) {
  return <RegisteredPartiesPage {...props} defaultSection="dashboard" />;
}
