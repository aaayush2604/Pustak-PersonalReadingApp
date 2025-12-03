import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

import styles from './popularbookcard.style'

const PopularBookCard = ({item,selectedBook,handleCardPress}) => {
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={()=>handleCardPress(item)}
    >
    <TouchableOpacity style={styles.logoContainer}>
      <Image
        source={{
        uri: `https://covers.openlibrary.org/b/id/${item.cover_id}-M.jpg`
        }}
        resizeMode="contain"
        style={styles.logoImage}
      />
    </TouchableOpacity>
        
    <View style={styles.textContainer}>
      <Text style={styles.bookName}>
        {item.title}
      </Text>
      <Text style={styles.authorName}>{item.authors[0].name}</Text>
    </View>
    </TouchableOpacity>
  )
}

export default PopularBookCard;