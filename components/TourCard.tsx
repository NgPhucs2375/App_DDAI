import {View, Text, Image, StyleSheet} from 'react-native';

//===============================================================================
// TourCard Component
//==============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  name: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  price: { color: "green", marginTop: 4 },
});

export default function TourCard({tour}: {tour: any}) {
return (
    <View style={styles.card}>
        <Image source={{uri:tour.image}} style={styles.image}/>
        <Text style={styles.name}>{tour.name} </Text>
        <Text style={styles.price}>{tour.price.toLocaleString()} VND</Text>
    </View>
);

}