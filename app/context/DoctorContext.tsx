import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DoctorProfile = {
  fullName: string;
  specialty: string;
  hospital: string;
  aboutMe: string;
  profilePhotoUrl?: string;
  email: string;
};

type DoctorContextType = {
  doctor: DoctorProfile | null;
  setDoctor: (profile: DoctorProfile) => void;
  updateDoctor: (updates: Partial<DoctorProfile>) => void;
};

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctorState] = useState<DoctorProfile | null>(null);

  // Load doctor data from AsyncStorage on mount
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        const storedDoctor = await AsyncStorage.getItem('doctorData');
        if (storedDoctor) {
          setDoctorState(JSON.parse(storedDoctor));
        }
      } catch (error) {
        console.error('Error loading doctor data:', error);
      }
    };

    loadDoctorData();
  }, []);

  const setDoctor = async (profile: DoctorProfile) => {
    try {
      await AsyncStorage.setItem('doctorData', JSON.stringify(profile));
      setDoctorState(profile);
    } catch (error) {
      console.error('Error saving doctor data:', error);
    }
  };

  const updateDoctor = async (updates: Partial<DoctorProfile>) => {
    if (doctor) {
      const updatedDoctor = { ...doctor, ...updates };
      try {
        await AsyncStorage.setItem('doctorData', JSON.stringify(updatedDoctor));
        setDoctorState(updatedDoctor);
      } catch (error) {
        console.error('Error updating doctor data:', error);
      }
    }
  };

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, updateDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error('useDoctor must be used within a DoctorProvider');
  return context;
}; 