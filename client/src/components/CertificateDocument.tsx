'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register a nice font if possible, or use standard ones
// Font.register({
//   family: 'Outfit',
//   src: 'https://fonts.gstatic.com/s/outfit/v11/Q_39Sj64_U8jXN7K8K8K.ttf'
// });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: '1pt solid #e5e7eb',
    padding: 20,
    borderRadius: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4f46e5',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  presentedTo: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    borderBottom: '1pt solid #4f46e5',
    paddingBottom: 2,
    textAlign: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  courseInfo: {
    fontSize: 12,
    color: '#4b5563',
    maxWidth: 400,
    lineHeight: 1.3,
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  footerItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footerValue: {
     fontSize: 11,
     fontWeight: 'bold',
     color: '#374151',
  },
  footerLabel: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 2,
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 3,
    width: 80,
    textAlign: 'center',
  }
});

interface CertificateData {
  userName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
  organizationName: string;
}

export const CertificateDocument = ({ data }: { data: CertificateData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.subtitle}>Certificate of Achievement</Text>
        <Text style={styles.title}>Excellence Award</Text>
        
        <Text style={styles.presentedTo}>This is safely presented to</Text>
        <Text style={styles.userName}>{data.userName}</Text>
        
        <Text style={styles.courseInfo}>
          for successfully completing the academic requirements and practical assessments of the professional course
        </Text>
        <Text style={styles.courseTitle}>
          {data.courseTitle}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerValue}>{data.organizationName}</Text>
            <Text style={styles.footerLabel}>Organization</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerValue}>
              {new Date(data.issuedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Text style={styles.footerLabel}>Date Issued</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerValue}>{data.certificateId}</Text>
            <Text style={styles.footerLabel}>Verification ID</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
