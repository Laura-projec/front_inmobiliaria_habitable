import axios from 'axios'

export const fetchPermissions = async () => {
let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  try { 
    const response = await axios.get(baseURL + '/auth/permisos')

    // console.log('response',response.data);
    
    return response.data || [] // Ajusta según la estructura de la respuesta
  } catch (error) {
    console.error('Error obteniendo permisos:', error)
    return []
  }
}
