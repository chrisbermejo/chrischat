import { InfoProvider } from '../../contexts/InfoContext'

import Nav from '../../components/Nav/Nav'
import Body from '../../components/Body/Body'

import '../../App.css';

export default function App() {
    return (
        <InfoProvider>
            <div className='App'>
                <Nav />
                <Body />
            </div>
        </InfoProvider>
    );
};