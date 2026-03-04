import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';

function AgentMarketplace() {
  const [agents, setAgents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAgents();
    fetchStats();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handlePurchase = async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId })
      });

      if (response.ok) {
        alert('🎉 Agent purchased successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to purchase agent');
      }
    } catch (error) {
      alert('Error purchasing agent');
    }
  };

  const categories = [
    { id: 'all', name: 'All Agents', icon: '🤖' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'scheduling', name: 'Scheduling', icon: '📅' },
    { id: 'support', name: 'Support', icon: '💬' },
    { id: 'data_entry', name: 'Data Entry', icon: '📊' },
    { id: 'content', name: 'Content', icon: '✍️' },
    { id: 'research', name: 'Research', icon: '🔍' }
  ];

  const filteredAgents = selectedCategory === 'all' 
    ? agents 
    : agents.filter(a => a.category === selectedCategory);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🤖 AI Agent Marketplace
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
            Choose from our collection of pre-built AI agents
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#06b6d4' }}>
                {stats.total_agents}
              </div>
              <div style={{ color: '#94a3b8' }}>Available Agents</div>
            </div>
            <div style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#a855f7' }}>
                {stats.total_purchases}
              </div>
              <div style={{ color: '#94a3b8' }}>Total Purchases</div>
            </div>
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#06b6d4' }}>
                {stats.total_tasks_executed}
              </div>
              <div style={{ color: '#94a3b8' }}>Tasks Executed</div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          padding: '0.5rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedCategory === cat.id 
                  ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: selectedCategory === cat.id 
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Agents Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: agent.is_popular 
                  ? '2px solid rgba(6, 182, 212, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(6, 182, 212, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {agent.is_popular && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  ⭐ Popular
                </div>
              )}

              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{agent.icon}</div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                  {agent.name}
                </h3>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {agent.description}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Features:
                  </div>
                  {agent.features.slice(0, 3).map((feature, i) => (
                    <div key={i} style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      ✓ {feature}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(6, 182, 212, 0.05)',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Price</div>
                    <div style={{ color: '#06b6d4', fontSize: '1.8rem', fontWeight: '800' }}>
                      ${agent.price_monthly}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>per month</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Includes</div>
                    <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700' }}>
                      {agent.tasks_included.toLocaleString()}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>tasks/month</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#fbbf24', fontSize: '1.2rem' }}>⭐ {agent.rating}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Rating</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#06b6d4', fontSize: '1.2rem', fontWeight: '700' }}>
                      {agent.total_purchases}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Purchases</div>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(agent.id)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Purchase Agent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgentMarketplace;
