import React from "react";
import { StyleSheet, Text, View } from "react-native";


export default function Discovery() {
    return (
        <View style={styles.container}>
            <Text>Discovery screens</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
    },
});