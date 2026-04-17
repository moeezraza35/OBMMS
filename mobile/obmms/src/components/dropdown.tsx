import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { backgroupColor, textColor } from '../config';

interface DropDownProps {
  list: Array<{ id: number; name: string }>;
  value?: number;                 // currently selected id
  onSelect?: (item: { id: number; name: string }) => void;
  placeholder?: string;
}

const DropDown: React.FC<DropDownProps> = ({
  list,
  value,
  onSelect,
  placeholder = 'Select Bus',
}) => {
  const [visible, setVisible] = useState(false);
  const selectedItem = list.find(item => item.id === value);

  const handleSelect = (item: { id: number; name: string }) => {
    onSelect?.(item);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Dropdown button */}
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Modal overlay for dropdown list */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={list}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderColor: "#cfcfcf77",
    borderWidth: 1,
    borderRadius: 10
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: backgroupColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 50,
  },
  buttonText: {
    color: textColor,
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    color: textColor,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: backgroupColor,
    borderRadius: 8,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  itemText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default DropDown;