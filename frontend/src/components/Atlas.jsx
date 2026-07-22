import React from 'react';
import flags from '../assets/flags.json';

const Atlas = ({ onClose }) => {
  const itemsPerRow = 4;
  const rows = Math.ceil(flags.length / itemsPerRow);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', color: 'white', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>World Atlas</h2>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer' }}>
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`, gap: '20px' }}>
          {flags.map((flag, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <img 
                src={`https://flagcdn.com/w40/${flag.code.toLowerCase()}.png`} 
                alt={flag.name} 
                style={{ width: 60, height: 40, objectFit: 'contain', marginBottom: 8 }}
              />
              <div>{flag.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Atlas;
