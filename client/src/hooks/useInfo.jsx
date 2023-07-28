import { useContext } from 'react';
import { InfoContext } from '../contexts/InfoContext';

const useInfo = () => {
    return useContext(InfoContext);
};

export default useInfo;