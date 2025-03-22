import { useState, useEffect, useCallback, useRef } from 'react';
import * as Ably from 'ably';

/**
 * Custom hook for Ably real-time messaging
 * @param {string} apiKey - Ably API key
 * @returns {Object} Ably utilities and state
 */
const useAbly = (apiKey) => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const channelsRef = useRef({});

  // Initialize Ably client
  useEffect(() => {
    if (!apiKey) return;

    try {
      const ablyClient = new Ably.Realtime({ 
        key: apiKey, 
        clientId: `client-${Date.now()}`,
        logLevel: 3 // Warning and above
      });
      
      ablyClient.connection.on('connecting', () => {
        console.log('Connecting to Ably...');
        setIsConnected(false);
        setConnectionError(null);
      });
      
      ablyClient.connection.on('connected', () => {
        console.log(`Connected to Ably. Connection ID: ${ablyClient.connection.id}`);
        setIsConnected(true);
        setConnectionError(null);
      });

      ablyClient.connection.on('disconnected', () => {
        console.log('Disconnected from Ably.');
        setIsConnected(false);
      });

      ablyClient.connection.on('suspended', () => {
        console.log('Connection suspended. Will retry automatically.');
        setIsConnected(false);
      });

      ablyClient.connection.on('failed', (err) => {
        console.error(`Connection failed: ${err.message}`);
        setIsConnected(false);
        setConnectionError(err.message);
      });
      
      setClient(ablyClient);

      return () => {
        // Cleanup on unmount
        ablyClient.close();
        setClient(null);
        setIsConnected(false);
        channelsRef.current = {};
      };
    } catch (error) {
      console.error(`Error connecting to Ably: ${error.message}`);
      setConnectionError(error.message);
      return () => {};
    }
  }, [apiKey]);

  // Subscribe to a channel
  const subscribe = useCallback((channelName, eventName, callback) => {
    if (!client || !isConnected) return null;
    
    try {
      // Reuse existing channel if possible
      let channel = channelsRef.current[channelName];
      if (!channel) {
        channel = client.channels.get(channelName);
        channelsRef.current[channelName] = channel;
      }
      
      const listener = message => {
        try {
          // Parse message data if it's a JSON string
          let data = message.data;
          if (typeof data === 'string' && data.startsWith('{')) {
            try {
              data = JSON.parse(data);
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }
          callback({
            name: message.name,
            data,
            id: message.id,
            timestamp: message.timestamp
          });
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };
      
      channel.subscribe(eventName, listener);
      console.log(`Subscribed to ${channelName}:${eventName}`);
      
      // Return unsubscribe function
      return () => {
        channel.unsubscribe(eventName, listener);
        console.log(`Unsubscribed from ${channelName}:${eventName}`);
      };
    } catch (error) {
      console.error(`Error subscribing to ${channelName}: ${error.message}`);
      return null;
    }
  }, [client, isConnected]);

  // Publish to a channel
  const publish = useCallback((channelName, eventName, data) => {
    if (!client || !isConnected) {
      console.warn('Cannot publish: client not connected');
      return Promise.reject(new Error('Client not connected'));
    }
    
    try {
      let channel = channelsRef.current[channelName];
      if (!channel) {
        channel = client.channels.get(channelName);
        channelsRef.current[channelName] = channel;
      }
      
      return new Promise((resolve, reject) => {
        channel.publish(eventName, data, err => {
          if (err) {
            console.error(`Error publishing to ${channelName}: ${err.message}`);
            reject(err);
          } else {
            console.log(`Published to ${channelName}:${eventName}`);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error(`Error setting up publish to ${channelName}: ${error.message}`);
      return Promise.reject(error);
    }
  }, [client, isConnected]);

  // Unsubscribe and release a channel
  const releaseChannel = useCallback((channelName) => {
    if (!client) return;
    
    try {
      const channel = channelsRef.current[channelName];
      if (channel) {
        channel.unsubscribe();
        client.channels.release(channelName);
        delete channelsRef.current[channelName];
        console.log(`Released channel: ${channelName}`);
      }
    } catch (error) {
      console.error(`Error releasing channel ${channelName}: ${error.message}`);
    }
  }, [client]);

  return {
    client,
    isConnected,
    connectionError,
    subscribe,
    publish,
    releaseChannel
  };
};

export default useAbly;