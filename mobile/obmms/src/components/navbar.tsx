import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Static imports for all icons (normal and active versions)
const icons = {
  home: require("../assets/images/home.png"),
  homeActive: require("../assets/images/home-active.png"),
  dues: require("../assets/images/dues.png"),
  duesActive: require("../assets/images/dues-active.png"),
  profile: require("../assets/images/profile.png"),
  profileActive: require("../assets/images/profile-active.png"),
  schedule: require("../assets/images/schedule.png"),
  scheduleActive: require("../assets/images/schedule-active.png"),
};

type NavBarProps = {
  active: number; // 1: Home, 2: Dues, 3: Profile, 4: Schedule
};

function NavBar({ active }: NavBarProps) {
  const navigation = useNavigation();

  const navItems = [
    { key: "Home", screen: "Home", iconKey: "home", label: "Home", activeIndex: 1 },
    { key: "Dues", screen: "Dues", iconKey: "dues", label: "Dues", activeIndex: 2 },
    { key: "Profile", screen: "Profile", iconKey: "profile", label: "Profile", activeIndex: 3 },
    { key: "Schedule", screen: "Schedule", iconKey: "schedule", label: "Schedule", activeIndex: 4 },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = active === item.activeIndex;
        const iconSource = isActive ? icons[`${item.iconKey}Active` as keyof typeof icons] : icons[item.iconKey as keyof typeof icons];

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.button}
            onPress={() => navigation.navigate(item.screen as never)}
            activeOpacity={0.7}
          >
            <Image source={iconSource} style={styles.icon} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: "#64748b",
    fontWeight: "500",
  },
  activeLabel: {
    color: "#049888",
  },
});

export default NavBar;