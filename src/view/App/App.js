import './App.css';
import './index.css';
import Stack from '../Stack';
import GitInfo from 'react-git-info/macro'

const gitInfo = new GitInfo();
const version = `${process.env.REACT_APP_VERSION}-${gitInfo.commit.hash.substr(0, 8)}`;

function App() {
    
    return (
        <div className="App">
            <Stack />
            <div className='AppInfo'><span className='Name'>Replo</span> version <span className='Version'>{version}</span> - Sources: <a href='https://github.com/webgiss/replo'>https://github.com/webgiss/replo</a></div>
        </div>
    );
}

export default App;
