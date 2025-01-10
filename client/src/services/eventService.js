import axiosInstance from "./axiosInstance";

// Ottieni tutti gli eventi associati all'utente loggato
export const getEvents = async (userID) => {
  try {
    const response = await axiosInstance.get(`events`, {
      params: { userID },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Errore durante il recupero degli eventi"
    );
  }
};

// Ottieni tutti gli eventi a cui l'utente loggato è stato invitato
export const getInvitedEvents = async (userID) => {
  try {
    const response = await axiosInstance.get(`events/invited`, {
      params: { userID },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Errore durante il recupero degli eventi"
    );
  }
};


// Ottieni un evento tramite il suo ID
export const getEventById = async (id) => {
  try {
    const response = await axiosInstance.get(`events/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Errore durante il recupero dell'evento"
    );
  }
};

// Crea un nuovo evento
export const createNewEvent = async (eventData, userID) => {
  try {
    const response = await axiosInstance.post(`events`, { eventData, userID });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Errore durante la creazione dell'evento"
    );
  }
};

// Aggiorna un evento esistente
export const updateEvent = async (id, eventData) => {
  try {
    const response = await axiosInstance.put(`events/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Errore durante l'aggiornamento dell'evento"
    );
  }
};

// Cancella un evento
export const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`events/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Errore durante l'eliminazione dell'evento'"
    );
  }
};

export const handleInvitationResponse = async (id, userID, responseType) => {
  try {
    const response = await axiosInstance.put(`events/${id}/${responseType}`, {}, { params: { userID } });

    if (response.status === 200) {
      return response.data;
    } 
  } catch (error) {
    console.error("Error: ", error);
  }
};

export const sendEventAsICalendar = async (id, email, event) => {
  try {
    const response = await axiosInstance.post(`events/${id}/ics`, { event, email });
    return response.data;
  } catch (error) {
    console.error("Error: ", error);
  }
}