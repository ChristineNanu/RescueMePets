import React, { useState, useEffect } from 'react';
import '../App.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const [statsRes, activityRes] = await Promise.all([
        fetch(`http://localhost:8002/dashboard/stats?user_id=${user.id}`),
        fetch(`http://localhost:8002/dashboard/activity?user_id=${user.id}`)
      ]);
      setStats(await statsRes.json());
      setRecentActivity(await activityRes.json());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your AI automation overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total_agents || 0}</div>
            <div className="stat-label">Active Agents</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.total_tasks || 0}</div>
            <div className="stat-label">Tasks Executed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${stats?.total_spent || 0}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.hours_saved || 0}h</div>
            <div className="stat-label">Time Saved</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="empty-activity">No activity yet. Execute an agent to get started!</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">{activity.agent_icon}</div>
                  <div className="activity-details">
                    <div className="activity-title">{activity.agent_name}</div>
                    <div className="activity-task">{activity.task_description}</div>
                    <div className="activity-time">{new Date(activity.executed_at).toLocaleString()}</div>
                  </div>
                  <div className="activity-status">✅</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button onClick={() => window.location.href = '/marketplace'} className="action-btn primary">
              🛒 Browse Marketplace
            </button>
            <button onClick={() => window.location.href = '/my-agents'} className="action-btn secondary">
              ⚡ Execute Agent
            </button>
          </div>

          <h2 style={{ marginTop: '2rem' }}>Subscription</h2>
          <div className="subscription-card">
            <div className="subscription-tier">{stats?.subscription_tier || 'Starter'} Plan</div>
            <div className="subscription-price">${stats?.monthly_cost || 99}/month</div>
            <button className="upgrade-btn">Upgrade Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
