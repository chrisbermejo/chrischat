import Nav from './components/Nav/Nav'
import Body from './components/Body/Body'
import Dialog from './components/Dialog/Dialog'

import './App.css';


export default function App() {
    return (
        <>
            <Dialog />
            <div className='App'>
                <Nav />
                <Body />
            </div>
        </>
    );
}