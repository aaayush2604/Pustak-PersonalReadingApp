import {View,Text,TouchableOpacity,FlatList,ActivityIndicator} from 'react-native';
import { use, useState } from 'react';
import { useRouter } from 'expo-router';

import styles from './popularbooks.style';
import  {COLORS,SIZES} from '../../../constants'
import { isLoaded } from 'expo-font';
import PopularBookCard from '../../cards/popular/PopularBookCard';

import useFetchPopularBooks from '../../../hook/useFetchPopularBooks';

const genres=['fiction','romance','fantasy','mystery','history'];

const PopularBooks=()=>{
    const router=useRouter();
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    const {data,isLoading,error}=useFetchPopularBooks(randomGenre);

    const [selectedBook,setSelectedBook]=useState();

    const handleCardPress=(item)=>{
        setSelectedBook(item.key)
    }

    return (
        <View style={styles.container} >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Popular Books</Text>
                <TouchableOpacity>
                <Text style={styles.headerBtn}>Show All</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.cardsContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                ) : error ? (
                    <Text>Something went wrong</Text>
                ) : (
                    data?.map((book) => {
                    const workId = book.key.split("/").pop(); // "OL21177W"

                    return (
                        <PopularBookCard
                        item={book}
                        key={book.key}
                        handleCardPress={() =>
                            router.push({
                            pathname: "/book-details/[id]",
                            params: {
                                id: workId,                 // goes into [id].js
                                editionKey: book.cover_edition_key, // "OL38586477M"
                            },
                            })
                        }
                        />
                    );
                    })
                )}
            </View>
        </View>
    )
}

export default PopularBooks;