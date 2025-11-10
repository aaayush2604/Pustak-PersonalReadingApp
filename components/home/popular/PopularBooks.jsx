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
                {isLoading?(
                <ActivityIndicator size="large" color={COLORS.primary} />
                ):error?(
                <Text>Something went wrong</Text>
                ):(
                <FlatList
                    data={data}
                    renderItem={({item})=>(
                    <PopularBookCard 
                        item={item}
                        selectedBook={selectedBook}
                        handleCardPress={handleCardPress}
                    />
                    )}
                    keyExtractor={(item)=>item.key}
                    contentContainerStyle={{columnGap:SIZES.medium}}
                    horizontal
                />
                )}
            </View>
        </View>
    )
}

export default PopularBooks;