import React from 'react';
import CountersContainer from '../CountersContainer/CountersContainer';
import ObservablesCounter from '../ObservablesCounter/ObservablesCounter';

function App() {
  return (
    <div>
        <CountersContainer>
            <ObservablesCounter/>
        </CountersContainer>
        
    </div>
  );
}

export default App;
