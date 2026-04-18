import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NavBar from '../components/navbar';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth';
import { navigate } from '../utils/navigation';
import { accentColor, backgroupColor, textColor } from '../config';

function Profile() {
  const {user, permissions} = useContext(AuthContext)
  useEffect(() => {
    if (user === null){
      navigate("Login")
    }
  })
  if(user)
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Box with accentColor background */}
        <View style={[styles.accentBox, { backgroundColor: accentColor }]}>
          {/* Circle with initial letter */}
          <View style={styles.circle}>
            <Text style={[styles.initialText, { color: accentColor }]}>
              {user.name[0]}
            </Text>
          </View>
          
          {/* Name below the circle */}
          <Text style={styles.nameText}>{user.name}</Text>
          
          {/* ID below the name */}
          <Text style={styles.idText}>ID: {`${user.id}`}</Text>
        </View>

        {/* Personal Information Card (outside accent box) */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{`${user.id}`}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group:</Text>
            <Text style={styles.infoValue}>{user.is_admin?"Admin":JSON.stringify(permissions)}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Bottom Navigation Bar */}
      <NavBar active={3} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  accentBox: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  initialText: {
    fontSize: 36,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  idText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 90,
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: backgroupColor,
    borderColor: "#dc3545",
    borderWidth: 2,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: '600',
  },
})
export default Profile;