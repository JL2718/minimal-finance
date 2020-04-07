import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Web3 from 'web3';

import Button from '@material-ui/core/Button';

import HomePage from './pages/HomePage/HomePage';
import AppPage from './pages/AppPage/AppPage';
import './App.css';

const cEthAddress = '0xf92fbe0d3c0dcdae407923b2ac17ec223b1084e4';
const cEthAbi = require('./abi/cEth.json');
const daiAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
const daiAbi = require('./abi/dai.json');
const cDaiAddress = '0xe7bc397dbd069fc7d0109c0636d06888bb50668c';
const cDaiAbi = require('./abi/cDai.json');
const comptrollerAddress = '0x1f5d7f3caac149fe41b8bd62a3673fe6ec0ab73b';
const comptrollerAbi = require('./abi/comptroller.json');
const priceOracleAddress = '0x6998ed7daf969ea0950e01071aceeee54cccbab5';
const priceOracleAbi = require('./abi/priceOracle.json');

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			provider: '',
			address: '',
			web3: '',
			contracts_init: false,
			cEth: '',
			comptroller: '',
			priceOracle: '',
			dai: '',
			cDai: '',
		};
	}

	// initialize compound contracts
	init = async () => {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum);
			const networkID = await web3.eth.net.getId();
			const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);
			const comptroller = new web3.eth.Contract(
				comptrollerAbi,
				comptrollerAddress
			);
			const priceOracle = new web3.eth.Contract(
				priceOracleAbi,
				priceOracleAddress
			);
			const dai = new web3.eth.Contract(daiAbi, daiAddress);
			const cDai = new web3.eth.Contract(cDaiAbi, cDaiAddress);
			this.setState({
				cEth,
				comptroller,
				priceOracle,
				dai,
				cDai,
				web3,
				networkID,
				contracts_init: true,
				provider: window.ethereum,
			});
		}
	};

	async componentDidMount() {
		await this.init();
	}

	connectAccount = async () => {
		const address = await window.ethereum.enable();
		this.setState({ address: address[0] });
	};

	render() {
		const values = this.state;
		return this.state.contracts_init ? (
			<Router>
				<nav className='nav'>
					<p
						style={{
							textAlign: 'center',
							fontSize: '1.8em',
							color: 'white',
							fontWeight: 'bold',
						}}
					>
						Kovan DAI Loans
					</p>
					{this.state.address ? (
						<div>
							<Link to='/' className='nav-buttons'>
								<Button
									variant='contained'
									color='primary'
									onClick={() => {
										this.setState({ address: '' });
									}}
								>
									Exit
								</Button>
							</Link>
						</div>
					) : this.state.networkID === 42 ? (
						<Link to='/app' className='nav-buttons'>
							<Button
								variant='contained'
								color='primary'
								onClick={this.connectAccount}
							>
								App
							</Button>
						</Link>
					) : (
						<div className='nav-buttons'>
							<Button
								variant='contained'
								color='primary'
								disabled
							>
								Switch to Kovan
							</Button>
						</div>
					)}
				</nav>
				<Route exact path='/'>
					<HomePage
						cEth={this.state.cEth}
						cDai={this.state.cDai}
						networkID={this.state.networkID}
					/>
				</Route>
				<Route exact path='/app'>
					{this.state.address ? (
						<AppPage
							values={values}
							cEthAddress={cEthAddress}
							cDaiAddress={cDaiAddress}
						/>
					) : (
						<div>Loading..</div>
					)}
				</Route>
			</Router>
		) : (
			<div>Loading...</div>
		);
	}
}

export default App;
