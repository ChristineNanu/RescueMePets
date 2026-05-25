import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';

function SQLInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef(null);

  const exampleQueries = [
    "SELECT * FROM animals;",
    "SELECT name, species FROM animals WHERE age > 2;",
    "SELECT a.name, c.name as center_name FROM animals a JOIN centers c ON a.center_id = c.id;",
    "CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);",
    "CREATE INDEX idx_animals_species ON animals (species);",
    "SHOW TABLES;",
    "SHOW COLUMNS FROM animals;",
    "SHOW INDEXES FROM animals;"
  ];

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const result = await response.json();
      
      // save to history
      const newEntry = {
        query: query.trim(),
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setResults(prev => [newEntry, ...prev]);
      setHistory(prev => [query.trim(), ...prev]);
      setQuery('');
      setHistoryIndex(-1);
      
    } catch (error) {
      const errorEntry = {
        query: query.trim(),
        result: { error: `Network error: ${error.message}` },
        timestamp: new Date().toLocaleTimeString()
      };
      setResults(prev => [errorEntry, ...prev]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      executeQuery();
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setQuery(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setQuery(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setQuery('');
      }
    }
  };

  const renderResult = (result) => {
    if (result.error) {
      return (
        <div style={{ color: '#e53e3e', padding: '10px', backgroundColor: '#fed7d7', borderRadius: '5px' }}>
          ❌ Error: {result.error}
        </div>
      );
    }

    if (result.success && result.data) {
      if (result.data.length === 0) {
        return (
          <div style={{ color: '#38a169', padding: '10px', backgroundColor: '#c6f6d5', borderRadius: '5px' }}>
            ✅ Query executed successfully. No results returned.
          </div>
        );
      }

      return (
        <div>
          <div style={{ color: '#38a169', marginBottom: '10px' }}>
            ✅ Query executed successfully. {result.data.length} row(s) returned.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  {result.columns && result.columns.map(col => (
                    <th key={col} style={{ 
                      border: '1px solid #e2e8f0', 
                      padding: '8px', 
                      textAlign: 'left',
                      fontWeight: 'bold'
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f7fafc' }}>
                    {Object.values(row).map((value, colIdx) => (
                      <td key={colIdx} style={{ 
                        border: '1px solid #e2e8f0', 
                        padding: '8px'
                      }}>
                        {value !== null ? String(value) : 'NULL'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (result.success && result.message) {
      return (
        <div style={{ color: '#38a169', padding: '10px', backgroundColor: '#c6f6d5', borderRadius: '5px' }}>
          ✅ {result.message}
        </div>
      );
    }

    return (
      <div style={{ color: '#718096' }}>
        Unknown result format
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <h1>🗄️ SQL Interface</h1>
        <p>Interactive SQL query interface for the RescueMePets database</p>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Query Input */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>Query Editor</h3>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here... (Ctrl+Enter to execute, Ctrl+↑/↓ for history)"
            style={{
              width: '100%',
              height: '120px',
              padding: '15px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Monaco, Consolas, monospace',
              resize: 'vertical'
            }}
          />
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={executeQuery}
              disabled={isLoading || !query.trim()}
              style={{
                backgroundColor: isLoading ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? '⏳ Executing...' : '▶️ Execute Query'}
            </button>
            
            <button
              onClick={() => setQuery('')}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🗑️ Clear
            </button>
            
            <span style={{ fontSize: '12px', color: '#718096' }}>
              Tip: Use Ctrl+Enter to execute, Ctrl+↑/↓ for command history
            </span>
          </div>
        </div>

        {/* Database Management */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>🛠️ Database Management</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={async () => {
                if (window.confirm('This will delete ALL data. Are you sure?')) {
                  try {
                    const response = await fetch(`${API_BASE_URL}/reset-db`, { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                      alert('Database reset successfully!');
                      setResults([]);
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  } catch (error) {
                    alert(`Network error: ${error.message}`);
                  }
                }
              }}
              style={{
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🗑️ Reset Database
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE_URL}/load-sample-data`, { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    alert('Sample data loaded successfully!');
                  } else {
                    alert(`Error: ${result.error}`);
                  }
                } catch (error) {
                  alert(`Network error: ${error.message}`);
                }
              }}
              style={{
                backgroundColor: '#38a169',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📊 Load Sample Data
            </button>
            
            <span style={{ fontSize: '12px', color: '#718096', marginLeft: '10px' }}>
              Use these to start fresh or load demo data
            </span>
          </div>
        </div>

        {/* Example Queries */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>📚 Example Queries</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(example)}
                style={{
                  backgroundColor: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'Monaco, Consolas, monospace'
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>📊 Query Results</h3>
          
          {results.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#718096', 
              padding: '40px',
              fontStyle: 'italic'
            }}>
              No queries executed yet. Try running one of the example queries above!
            </div>
          ) : (
            <div>
              {results.map((entry, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '25px', 
                  paddingBottom: '20px',
                  borderBottom: idx < results.length - 1 ? '1px solid #e2e8f0' : 'none'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <code style={{ 
                      backgroundColor: '#f7fafc', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      {entry.query}
                    </code>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {entry.timestamp}
                    </span>
                  </div>
                  {renderResult(entry.result)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SQLInterface;