import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

type Tour = {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  price?: number;
  image?: string;
};

export default function TourCard({ tour }: { tour: Tour }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {tour.image ? (
        <Image source={{ uri: tour.image }} style={styles.image} />
      ) : null}
      <View style={styles.info}>
        <Text style={styles.title}>{tour.name}</Text>
        {tour.description ? <Text style={styles.desc}>{tour.description}</Text> : null}
        <Text style={styles.meta}>{tour.duration} • ${tour.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    marginTop: 6,
    color: '#666',
  },
  meta: {
    marginTop: 8,
    color: '#0288D1',
    fontWeight: '600',
  },
});