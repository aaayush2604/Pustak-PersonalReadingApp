import {useEffect, useState} from 'react';
import axios from 'axios';

const useFetchBooks=(query)=>{
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const options={
        method:"GET",
        url:"https://openlibrary.org/search.json",
        params:{
            q:query,
            limit:10
        }
    }

    const fetchData=async ()=>{
        setIsLoading(true);
        try{
            const response=await axios.request(options);

            setData(response.data.docs);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            alert("There is an error");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => {
        setIsLoading(true);
        fetchData();
    };

    return { data, isLoading, error, refetch };
}

export default useFetchBooks;