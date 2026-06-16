import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { accentColor } from '../config';
import NavBar from '../components/navbar';
import { navigate } from '../utils/navigation';
import { AuthContext } from '../context/auth';
import { LoadingContext } from '../context/loading';
import { makeRequest } from '../utils/request';

// Types for package and transaction data
interface PackageItem {
  id: string;
  name: string; // Month and year, e.g., "April 2026"
  amount: number; // Amount in PKR
}

interface TransactionItem {
  id: string;
  date: string; // e.g., "2026-03-15"
  time: string; // e.g., "14:30"
  amount: number;
  packageId: string;
}

function Dues() {
  const [packages, setPackages] = useState<Array<any>>([])
  const [history, setHistory] = useState<Array<any>>([])
  const { session_id, user } = useContext(AuthContext)
  const { setLoading } = useContext(LoadingContext)
  const loadData = async () => {
    setLoading(true)
    await makeRequest(
      "accounts/packages/",
      "GET",
      session_id,
      null,
      (data:{packages:Array<any>}) => {setPackages(data.packages)},
      null
    )
    await makeRequest(
      "accounts/history/",
      "GET",
      session_id,
      null,
      (data:{history:Array<any>}) => {setHistory(data.history)},
      null
    )
    setLoading(false)
  }
  useEffect(() => {
    if (user === null){
      navigate("Login")
    } else if (user.reset_required) {
      navigate("Password")
    }
    loadData()
  }, [])

  // Helper to format currency
  const formatCurrency = (amount: number): string => {
    return `PKR ${amount.toLocaleString()}`;
  };

  // Helper to format date for display (optional)
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Active Packages</Text>

        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              {/* Package ID */}
              <Text style={styles.packageId}>ID: {pkg.id}</Text>
              {/* Package Name (Month Year) */}
              <Text style={styles.packageName}>{ ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][pkg.month-1] } { pkg.year}</Text>
              {/* Amount in large font */}
              <Text style={styles.packageAmount}>{formatCurrency(pkg.price)}</Text>
            </View>
          ))}
        </View>

        {/* Transaction History Section */}
        <View style={styles.section}>
          <Text style={styles.headerTitle}>Payment History</Text>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((transaction) => (
                <View key={transaction.id} style={styles.historyItem}>
                  {/* Date and Time row */}
                  <View style={styles.historyRow}>
                    <Text style={styles.historyDate}>
                      📅 {formatDate(transaction.date)}
                    </Text>
                    <Text style={styles.historyTime}>
                      ⏰ {transaction.time}
                    </Text>
                  </View>
                  {/* Amount and Package ID row */}
                  <View style={styles.historyRow}>
                    <Text style={styles.historyAmount}>
                      💰 {formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={styles.historyPackageId}>
                      🆔 {transaction.package}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Optional extra spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      <NavBar active={2}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
  },
  packagesContainer: {
    justifyContent: 'space-between',
  },
  packageCard: {
    backgroundColor: accentColor,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  packageId: {
    fontSize: 12,
    color: "#ffffff77",
    marginBottom: 8,
    fontWeight: '500',
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    color: "white",
    marginBottom: 12,
  },
  packageAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: "white",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  historyList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 14,
    color: '#718096',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  historyPackageId: {
    fontSize: 13,
    color: '#4A6FFF',
    fontWeight: '600',
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  emptyText: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default Dues;