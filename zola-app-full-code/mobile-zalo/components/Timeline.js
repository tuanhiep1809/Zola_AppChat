import React from "react";
import { StyleSheet, Text, View } from "react-native";


export default function Timeline() {
    return (
        <View style={styles.container}>
            <Text>Timeline screens</Text>
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