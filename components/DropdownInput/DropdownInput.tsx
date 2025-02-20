import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface DropdownProps {
    options: string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = "Select an Option",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string) => {
        onSelect(value);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Dropdown Header */}
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text
                    style={[
                        styles.selectedText,
                        !selectedValue && styles.placeholderText,
                    ]}
                >
                    {selectedValue || placeholder}
                </Text>
                <FontAwesome
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="white"
                />
            </TouchableOpacity>

            {/* Dropdown List */}
            {isOpen && (
                <View style={styles.dropdownList}>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    index % 2 == 0 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: "",
                                    },
                                ]}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.optionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderWidth: 1,
        borderRadius: 6,
        width: "75%",
        borderColor: "#fff",
        color: "#fff",
        backgroundColor: "#25292e",
    },
    selectedText: {
        fontSize: 16,
        color: "#fff",
    },
    dropdownList: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ccc",
        marginTop: 0,
        maxHeight: 150,
        zIndex: 1000,
    },
    option: {
        padding: 12,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    placeholderText: {
        color: "rgba(255,255,255,.5)",
    },
});

export default Dropdown;
