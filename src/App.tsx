import React from 'react';
import logo from './logo.svg';
import './App.css';
import TokenTable from './components/tokens/TokenTable';

function App() {
	return (
		<div>

			<h3 className="font-bold">Top Tokens</h3>
			<TokenTable />

			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h1 className="text-3xl font-bold underline">
          Hello world!
				</h1>
				<button className="btn btn-primary">Button</button>
				<p>
          Edit
					{' '}
					<code>src/App.tsx</code>
					{' '}
          and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
          Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
