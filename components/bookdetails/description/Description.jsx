import React from 'react'
import { View, Text } from 'react-native'

import styles from './description.style'

const Description = ({info}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headText}>Book Description:</Text>
      <View style={styles.container}>
        <Text style={styles.contextText}>{info}</Text>
      </View>
    </View>
  )
}

export default Description;