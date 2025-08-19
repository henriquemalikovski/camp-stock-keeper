// MongoDB Service - API Backend
import type { InventoryItem } from '@/types/inventory';

// URL do backend - busca da variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ItemRequest {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  grupo_escoteiro: string;
  item_solicitado: string;
  quantidade: number;
  mensagem_adicional?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

class MongoDBService {
  // Inventory Items
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar itens: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar itens do inventário:', error);
      throw error;
    }
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar item do inventário:', error);
      throw error;
    }
  }

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar item do inventário:', error);
      throw error;
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar item: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao deletar item do inventário:', error);
      throw error;
    }
  }

  // Item Requests
  async getItemRequests(): Promise<ItemRequest[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar solicitações: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      throw error;
    }
  }

  async createItemRequest(request: Omit<ItemRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ItemRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar solicitação: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw error;
    }
  }

  async updateItemRequestStatus(id: string, status: string): Promise<ItemRequest> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status da solicitação:', error);
      throw error;
    }
  }
}

export const mongoDBService = new MongoDBService();
export type { ItemRequest };