import { Card, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { gatewayApi, type GatewayService } from '~/apis/gateway/index.ts';
import GatewayFilter from './filter/GatewayFilter.tsx';
import GatewayModal from './modals/GatewayModal.tsx';
import GatewayStatistics from './GatewayStatistics.tsx';
import GatewayTable from './table/GatewayTable.tsx';

const { Title } = Typography;

const GatewayManagement: React.FC = () => {
  const [services, setServices] = useState<GatewayService[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<GatewayService | null>(null);
  const [searchText, setSearchText] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const fetchedServices = await gatewayApi.getServices();
      setServices(fetchedServices);
      message.success('Services loaded successfully!');
    } catch (error) {
      console.error('Failed to load services:', error);
      message.error('Failed to load services. Using mock data for demonstration.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: GatewayService) => {
    try {
      const newService = await gatewayApi.createService(serviceData);
      setServices((prev) => [...prev, newService]);
      setModalVisible(false);
      message.success('Service created successfully!');
    } catch (error) {
      console.error('Failed to create service:', error);
      message.error('Failed to create service');
      throw error;
    }
  };

  const handleUpdateService = async (serviceData: GatewayService) => {
    try {
      if (!serviceData.id) {
        throw new Error('Service ID is required for update');
      }
      const updatedService = await gatewayApi.updateService(serviceData.id, serviceData);
      setServices((prev) =>
        prev.map((service) => (service.id === updatedService.id ? updatedService : service))
      );
      setModalVisible(false);
      setEditingService(null);
      message.success('Service updated successfully!');
    } catch (error) {
      console.error('Failed to update service:', error);
      message.error('Failed to update service');
      throw error;
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await gatewayApi.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      message.success('Service deleted successfully!');
    } catch (error) {
      console.error('Failed to delete service:', error);
      message.error('Failed to delete service');
    }
  };

  const handleTestConnection = async (service: GatewayService) => {
    if (!service.id) {
      message.error('Service ID is required for testing');
      return;
    }

    try {
      message.loading({ content: 'Testing connection...', key: 'test' });

      const result = await gatewayApi.testConnection(service.name);

      setServices((prev) =>
        prev.map((s) =>
          s.id === result.service.id
            ? {
                ...s,
                status: result.status,
                lastChecked: new Date().toISOString(),
                responseTime: result.responseTime,
              }
            : s
        )
      );

      message.success({
        content:
          result.status === 'healthy'
            ? `Connection successful! Response time: ${result.responseTime}ms`
            : `Connection failed! ${result.error || ''}`,
        key: 'test',
      });
    } catch (error) {
      console.error('Failed to test connection:', error);
      message.error({ content: 'Test failed', key: 'test' });
    }
  };

  const handleScanServices = async () => {
    setScanning(true);
    try {
      message.loading({ content: 'Scanning for services...', key: 'scan' });

      // Call the scan API endpoint
      const scannedServices = await gatewayApi.scanServices();
      setServices(scannedServices);

      const healthyCount = scannedServices.filter((s) => s.status === 'healthy').length;
      message.success({
        content: `Scan complete! ${healthyCount} of ${scannedServices.length} services are healthy.`,
        key: 'scan',
        duration: 4,
      });
    } catch (error) {
      console.error('Failed to scan services:', error);
      message.error({ content: 'Scan failed', key: 'scan' });
    } finally {
      setScanning(false);
    }
  };

  const handleRaiseService = async (service: GatewayService) => {
    if (!service.id) {
      message.error('Service ID is required for raising');
      return;
    }

    try {
      message.loading({ content: 'Raising service...', key: 'raise' });

      const updatedService = await gatewayApi.raiseService(service.id);

      setServices((prev) => prev.map((s) => (s.id === updatedService.id ? updatedService : s)));

      message.success({
        content: `Service "${service.name}" has been raised successfully!`,
        key: 'raise',
      });
    } catch (error) {
      console.error('Failed to raise service:', error);
      message.error({ content: 'Failed to raise service', key: 'raise' });
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.host.toLowerCase().includes(searchText.toLowerCase())
  );

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;
  const enabledCount = services.filter((s) => s.enabled).length;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gateway Services Management</Title>

      <GatewayStatistics
        totalServices={services.length}
        enabledServices={enabledCount}
        healthyServices={healthyCount}
        unhealthyServices={unhealthyCount}
      />

      <Card>
        <GatewayFilter
          searchText={searchText}
          onSearchChange={setSearchText}
          onAddService={() => {
            setEditingService(null);
            setModalVisible(true);
          }}
          onRefresh={loadServices}
          onScanService={handleScanServices}
          loading={loading}
          scanning={scanning}
        />

        <GatewayTable
          services={filteredServices}
          loading={loading}
          onEdit={(service) => {
            setEditingService(service);
            setModalVisible(true);
          }}
          onDelete={handleDeleteService}
          onTestConnection={handleTestConnection}
          onRaiseService={handleRaiseService}
        />
      </Card>

      <GatewayModal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingService(null);
        }}
        onSave={editingService ? handleUpdateService : handleCreateService}
        service={editingService}
      />
    </div>
  );
};

export default GatewayManagement;
