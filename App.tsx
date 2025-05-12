import 'react-native-url-polyfill/auto';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DoctorLogin from './app/screens/DoctorLogin';
import CreateDoctorAccount from './app/screens/CreateDoctorAccount';
import DoctorDashboard from './app/screens/DoctorDashboard';
import DoctorPatients from './app/screens/DoctorPatients';
import DoctorPatientInvitation from './app/screens/DoctorPatientInvitation';
import DoctorTaskManagement from './app/screens/DoctorTaskManagement';
import DoctorAssignTask from './app/screens/DoctorAssignTask';
import DoctorCreateTask from './app/screens/DoctorCreateTask';
import DoctorSettings from './app/screens/DoctorSettings';
import PatientOverview from './app/screens/PatientOverview';
import LandingScreen from './app/screens/LandingScreen';
import PatientInvitationCode from './app/screens/PatientInvitationCode';
import PatientRegistration from './app/screens/PatientRegistration';
import PatientInvitePlayers from './app/screens/PatientInvitePlayers';
import PatientAddSecrets from './app/screens/PatientAddSecrets';
import PatientDashboard from './app/screens/PatientDashboard';
import PatientSubmitProof from './app/screens/PatientSubmitProof';
import PatientTaskHistory from './app/screens/PatientTaskHistory';
import PatientTaskFailed from './app/screens/PatientTaskFailed';
import PatientSettings from './app/screens/PatientSettings';
import PatientProfile from './app/screens/PatientProfile';
import PatientManageSecrets from './app/screens/PatientManageSecrets';
import PatientManageTasks from './app/screens/PatientManageTasks';
import PatientChangePassword from './app/screens/PatientChangePassword';
import PatientPrivacySettings from './app/screens/PatientPrivacySettings';
import PatientTermsOfService from './app/screens/PatientTermsOfService';
import PatientPrivacyPolicy from './app/screens/PatientPrivacyPolicy';
import PatientHelpCenter from './app/screens/PatientHelpCenter';
import PatientGroup from './app/screens/PatientGroup';
import PatientCreateTask from './app/screens/PatientCreateTask';
import PatientTaskCompleted from './app/screens/PatientTaskCompleted';
import PatientTaskList from './app/screens/PatientTaskList';
import { TaskProvider } from './app/context/TaskContext';
import DoctorProfile from './app/screens/DoctorProfile';
import { DoctorProvider } from './app/context/DoctorContext';
import PlayerProfile from './app/screens/PlayerProfile';
import PlayerSettings from './app/screens/PlayerSettings';
import SecretRevealsPatient from './app/screens/SecretRevealsPatient';
import SecretRevealsPlayer from './app/screens/SecretRevealsPlayer';
import DoctorGroup from './app/screens/DoctorGroup';
import PatientLogin from './app/screens/PatientLogin';
import PlayerLogin from './app/screens/PlayerLogin';
import PlayerJoin from './app/screens/PlayerJoin';
import PlayerCreateAccount from './app/screens/PlayerCreateAccount';
import PlayerAddSecret from './app/screens/PlayerAddSecret';
import PlayerCreateTask from './app/screens/PlayerCreateTask';
import PlayerDashboard from './app/screens/PlayerDashboard';
import PlayerTaskHistory from './app/screens/PlayerTaskHistory';
import PlayerGroup from './app/screens/PlayerGroup';
import PlayerManageSecrets from './app/screens/PlayerManageSecrets';
import PlayerManageTasks from './app/screens/PlayerManageTasks';
import PlayerTaskCompleted from './app/screens/PlayerTaskCompleted';
import PlayerSubmitProof from './app/screens/PlayerSubmitProof';
import TaskDetail from './app/screens/TaskDetail';
import DoctorTaskList from './app/screens/DoctorTaskList';
import DoctorTaskDetails from './app/screens/DoctorTaskDetails';
import PlayerTaskFailed from './app/screens/PlayerTaskFailed';
import WelcomeDoctorScreen from './app/screens/WelcomeDoctorScreen';
import PatientTaskDetails from '@screens/PatientTaskDetails';
import PatientEditProfile from '@screens/PatientEditProfile';
import DoctorGroupList from './app/screens/DoctorGroupList';

// Define the patient type
export type Patient = {
  id: string;
  name: string;
  image: string;
  status: 'Good' | 'Needs Attention';
  streak: number;
  lastActivity: string;
  tasksStatus: 'All complete' | string;
  email?: string;
  invitationCode?: string;
  registrationDate?: string;
};

// Define the navigation param list
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  WelcomeDoctor: undefined;
  DoctorHome: undefined;
  PatientInvitationCode: undefined;
  PatientRegistration: {
    doctorInfo: {
      name: string;
      specialization: string;
      invitationCode: string;
    };
    group_id?: string;
  };
  PatientInvitePlayers: {
    group_id: string;
  };
  PatientAddSecrets: {
    group_id: string;
  };
  PatientDashboard: undefined;
  PatientGroup: undefined;
  PatientTaskList: undefined;
  PatientSubmitProof: {
    task: {
      id: string;
      icon: string;
      title: string;
      description: string;
      frequency: string;
      assignedBy: string;
      dueIn: string;
      risk: number;
      status: 'pending' | 'completed';
    };
  };
  PatientTaskHistory: undefined;
  PatientTaskFailed: {
    taskData: {
      taskTitle: string;
      taskDescription: string;
      secret: string;
      friendComment?: {
        name: string;
        comment: string;
        avatar?: string;
      };
    };
  };
  PatientSettings: undefined;
  PatientProfile: undefined;
  PatientManageSecrets: undefined;
  PatientManageTasks: undefined;
  PatientChangePassword: undefined;
  PatientPrivacySettings: undefined;
  PatientTermsOfService: undefined;
  PatientPrivacyPolicy: undefined;
  PatientHelpCenter: undefined;
  DoctorLogin: undefined;
  CreateDoctorAccount: undefined;
  DoctorDashboard: {
    doctorName?: string;
    email?: string;
    specialization?: string;
  } | undefined;
  DoctorPatients: undefined;
  DoctorPatientInvitation: undefined;
  DoctorTaskManagement: { updatedTask?: {
    id: string;
    icon: string;
    title: string;
    description: string;
    patientCount: number;
    iconBgColor: string;
  } };
  DoctorAssignTask: { task: {
    id: string;
    icon: string;
    title: string;
    description: string;
    patientCount: number;
    iconBgColor: string;
  } };
  DoctorCreateTask: undefined;
  DoctorSettings: {
    doctorName?: string;
    email?: string;
    specialization?: string;
  };
  DoctorProfile: { editMode?: boolean } | undefined;
  DoctorGroup: { group_id: string };
  PatientOverview: { patient: {
    id: string;
    name: string;
    image: string;
    status: string;
    streak: number;
    lastActivity: string;
    tasksStatus: string;
  } };
  PatientCreateTask: {
    task?: {
      id: string;
      icon: string;
      title: string;
      description: string;
      frequency: string;
      assignedBy: string;
      hour?: string;
      minute?: string;
      amPm?: 'AM' | 'PM';
      proofRequired?: string[];
      status?: 'pending' | 'completed';
    };
  };
  PatientTaskCompleted: {
    taskData: {
      title: string;
      description: string;
      proofImage?: string;
      feeling?: string;
    };
  };
  PlayerJoin: undefined;
  PlayerCreateAccount: {
    groupInfo: {
      owner: { name: string; avatar: string };
      groupName: string;
      description: string;
    };
    group_id: string;
  };
  PlayerAddSecret: {
    group_id: string;
  };
  PlayerCreateTask: undefined;
  PlayerDashboard: undefined;
  PlayerGroup: undefined;
  PlayerTaskHistory: undefined;
  PlayerTaskCompleted: undefined;
  PlayerSubmitProof: {
    task: {
      id: string;
      icon: string;
      title: string;
      description: string;
      frequency: string;
      assignedBy: string;
      risk: number;
      status: string;
    };
  };
  PlayerSettings: undefined;
  PlayerProfile: undefined;
  PlayerManageSecrets: undefined;
  PlayerManageTasks: undefined;
  PlayerChangePassword: undefined;
  PlayerPrivacySettings: undefined;
  PlayerTermsOfService: undefined;
  PlayerPrivacyPolicy: undefined;
  PlayerHelpCenter: undefined;
  SecretRevealsPatient: undefined;
  SecretRevealsPlayer: undefined;
  TaskDetail: { taskId: string };
  PatientLogin: undefined;
  PlayerLogin: undefined;
  DoctorTaskList: undefined;
  DoctorTaskDetails: { taskId: string };
  PlayerTaskFailed: {
    taskData: {
      taskTitle: string;
      taskDescription: string;
      secret: string;
      friendComment?: {
        name: string;
        comment: string;
        avatar?: string;
      };
    };
  };
  PatientTaskDetails: {
    taskId: string;
  };
  PatientEditProfile: undefined;
  DoctorGroupList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <TaskProvider>
      <DoctorProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
              initialRouteName="Landing"
            >
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="WelcomeDoctor" component={WelcomeDoctorScreen} />
              <Stack.Screen name="PatientInvitationCode" component={PatientInvitationCode} />
              <Stack.Screen name="PatientRegistration" component={PatientRegistration} />
              <Stack.Screen name="PatientInvitePlayers" component={PatientInvitePlayers} />
              <Stack.Screen name="PatientAddSecrets" component={PatientAddSecrets} />
              <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
              <Stack.Screen name="PatientGroup" component={PatientGroup} />
              <Stack.Screen name="PatientTaskList" component={PatientTaskList} />
              <Stack.Screen name="PatientSubmitProof" component={PatientSubmitProof} />
              <Stack.Screen name="PatientTaskHistory" component={PatientTaskHistory} />
              <Stack.Screen name="PatientTaskFailed" component={PatientTaskFailed} />
              <Stack.Screen name="PatientSettings" component={PatientSettings} />
              <Stack.Screen name="PatientProfile" component={PatientProfile} />
              <Stack.Screen name="PatientManageSecrets" component={PatientManageSecrets} />
              <Stack.Screen name="PatientManageTasks" component={PatientManageTasks} />
              <Stack.Screen name="PatientChangePassword" component={PatientChangePassword} />
              <Stack.Screen name="PatientPrivacySettings" component={PatientPrivacySettings} />
              <Stack.Screen name="PatientTermsOfService" component={PatientTermsOfService} />
              <Stack.Screen name="PatientPrivacyPolicy" component={PatientPrivacyPolicy} />
              <Stack.Screen name="PatientHelpCenter" component={PatientHelpCenter} />
              <Stack.Screen name="DoctorLogin" component={DoctorLogin} />
              <Stack.Screen name="PatientLogin" component={PatientLogin} />
              <Stack.Screen name="PlayerLogin" component={PlayerLogin} />
              <Stack.Screen name="CreateDoctorAccount" component={CreateDoctorAccount} />
              <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
              <Stack.Screen name="DoctorPatients" component={DoctorPatients} />
              <Stack.Screen name="DoctorPatientInvitation" component={DoctorPatientInvitation} />
              <Stack.Screen name="DoctorTaskManagement" component={DoctorTaskManagement} />
              <Stack.Screen name="DoctorAssignTask" component={DoctorAssignTask} />
              <Stack.Screen name="DoctorCreateTask" component={DoctorCreateTask} />
              <Stack.Screen name="DoctorSettings" component={DoctorSettings} />
              <Stack.Screen name="DoctorProfile" component={DoctorProfile} />
              <Stack.Screen name="DoctorGroup" component={DoctorGroup} />
              <Stack.Screen name="PatientOverview" component={PatientOverview} />
              <Stack.Screen name="PatientCreateTask" component={PatientCreateTask} />
              <Stack.Screen name="PatientTaskCompleted" component={PatientTaskCompleted} />
              <Stack.Screen name="PlayerJoin" component={PlayerJoin} />
              <Stack.Screen name="PlayerCreateAccount" component={PlayerCreateAccount} />
              <Stack.Screen name="PlayerAddSecret" component={PlayerAddSecret} />
              <Stack.Screen name="PlayerCreateTask" component={PlayerCreateTask} />
              <Stack.Screen name="PlayerDashboard" component={PlayerDashboard} />
              <Stack.Screen name="PlayerTaskHistory" component={PlayerTaskHistory} />
              <Stack.Screen name="PlayerGroup" component={PlayerGroup} />
              <Stack.Screen name="PlayerProfile" component={PlayerProfile} />
              <Stack.Screen name="PlayerSettings" component={PlayerSettings} />
              <Stack.Screen name="PlayerManageSecrets" component={PlayerManageSecrets} />
              <Stack.Screen name="PlayerManageTasks" component={PlayerManageTasks} />
              <Stack.Screen name="PlayerTaskCompleted" component={PlayerTaskCompleted} />
              <Stack.Screen name="PlayerSubmitProof" component={PlayerSubmitProof} />
              <Stack.Screen name="SecretRevealsPatient" component={SecretRevealsPatient} />
              <Stack.Screen name="SecretRevealsPlayer" component={SecretRevealsPlayer} />
              <Stack.Screen name="TaskDetail" component={TaskDetail} />
              <Stack.Screen name="DoctorTaskList" component={DoctorTaskList} />
              <Stack.Screen name="DoctorTaskDetails" component={DoctorTaskDetails} />
              <Stack.Screen name="PlayerTaskFailed" component={PlayerTaskFailed} />
              <Stack.Screen name="PatientTaskDetails" component={PatientTaskDetails} />
              <Stack.Screen name="PatientEditProfile" component={PatientEditProfile} />
              <Stack.Screen name="DoctorGroupList" component={DoctorGroupList} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </DoctorProvider>
    </TaskProvider>
  );
} 