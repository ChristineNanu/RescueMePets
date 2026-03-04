import React, { useState, useEffect } from 'react';
import '../App.css';

function MyAgents() {
  const [myAgents, setMyAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [taskInput, setTaskInput] = useState({});

  useEffect(() => {
    fetchMyAgents();
  }, []);

  const fetchMyAgents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8002/my-agents?user_id=${user.id}`);
      const data = await response.json();
      setMyAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeAgent = async (purchasedAgentId, agentName) => {
    const task = taskInput[purchasedAgentId];
    if (!task?.trim()) {
      alert('Please enter a task description');
      return;
    }

    setExecuting(purchasedAgentId);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:8002/execute-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          purchased_agent_id: purchasedAgentId,
          task_description: task
        })
      });
      const result = await response.json();
      alert(`✅ ${agentName} executed successfully!\n\nResult: ${result.result}`);
      setTaskInput({ ...taskInput, [purchasedAgentId]: '' });
      fetchMyAgents();
    } catch (error) {
      alert('Error executing agent');
    } finally {
      setExecuting(null);
    }
  };

  if (loading) return <div className="loading">Loading your agents...</div>;

  return (
    <div className="my-agents-container">
      <div className="my-agents-header">
        <h1>My AI Agents</h1>
        <p>Manage and execute your purchased agents</p>
      </div>

      {myAgents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h2>No agents yet</h2>
          <p>Visit the marketplace to purchase your first AI agent</p>
          <button onClick={() => window.location.href = '/marketplace'} className="cta-button">
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="my-agents-grid">
          {myAgents.map((pa) => (
            <div key={pa.id} className="my-agent-card">
              <div className="agent-card-header">
                <span className="agent-icon">{pa.agent.icon}</span>
                <div>
                  <h3>{pa.agent.name}</h3>
                  <span className="category-badge">{pa.agent.category}</span>
                </div>
              </div>
              
              <div className="usage-stats">
                <div className="stat">
                  <span className="stat-label">Tasks Used</span>
                  <span className="stat-value">{pa.tasks_used.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Tasks Remaining</span>
                  <span className="stat-value">{(pa.agent.tasks_included - pa.tasks_used).toLocaleString()}</span>
                </div>
              </div>

              <div className="execute-section">
                <textarea
                  placeholder="Describe the task you want this agent to perform..."
                  value={taskInput[pa.id] || ''}
                  onChange={(e) => setTaskInput({ ...taskInput, [pa.id]: e.target.value })}
                  rows="3"
                />
                <button
                  onClick={() => executeAgent(pa.id, pa.agent.name)}
                  disabled={executing === pa.id}
                  className="execute-button"
                >
                  {executing === pa.id ? '⏳ Executing...' : '▶️ Execute Agent'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAgents;
