import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PollDetailScreen from './screens/PollDetailScreen';
import PollsScreen from './screens/PollsScreen';
import PollSearchScreen from './screens/PollSearchScreen';
import PollCreateScreen from './screens/PollCreateScreen';
import MyScreen from './screens/MyScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 메인 탭 네비게이션
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Polls') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3897f0',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="Polls" component={PollsScreen} options={{ title: '여론조사' }} />
      <Tab.Screen name="News" component={HomeScreen} options={{ title: '뉴스' }} />
      <Tab.Screen name="Profile" component={MyScreen} options={{ title: '프로필' }} />
    </Tab.Navigator>
  );
}

// 메인 앱 컴포넌트
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="PollDetail" 
          component={PollDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="PollSearch" component={PollSearchScreen} />
        <Stack.Screen name="PollCreate" component={PollCreateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 