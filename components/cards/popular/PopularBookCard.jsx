import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

import styles from './popularbookcard.style'

const PopularBookCard = ({item,selectedBook,handleCardPress}) => {

  return (
    <TouchableOpacity 
      style={styles.container(selectedBook,item)}
      onPress={()=>handleCardPress(item)}
    >
    <TouchableOpacity style={styles.logoContainer(selectedBook,item)}>
      <Image
        source={{
        uri: `https://covers.openlibrary.org/b/id/${item.cover_id}-M.jpg`
        }}
        resizeMode="contain"
        style={styles.logoImage}
      />
    </TouchableOpacity>
    <Text style={styles.authorName} numberOfLines={1}>{item.authors[0].name}</Text>

    <View style={styles.infoContainer}>
      <Text style={styles.jobName(selectedBook,item)}>
        {item.title}
      </Text>
      <Text style={styles.location}>{item.first_publish_year}</Text>
    </View>
    </TouchableOpacity>
  )
}

export default PopularBookCard;