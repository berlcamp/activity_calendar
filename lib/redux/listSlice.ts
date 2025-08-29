// /lib/redux/listSlice.ts
import { Household, Resident, Voter } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ListState {
  households: Household[]
  voters: Voter[]
  residents: Resident[]
  householdsPage: number
  residentsPage: number
  votersPage: number
}

const initialState: ListState = {
  households: [],
  voters: [],
  residents: [],
  householdsPage: 1,
  residentsPage: 1,
  votersPage: 1
}

const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    // Voters
    setVoters: (state, action: PayloadAction<Voter[]>) => {
      state.voters = action.payload
    },
    appendVoters: (state, action: PayloadAction<Voter[]>) => {
      state.voters = [...state.voters, ...action.payload]
      state.votersPage += 1
    },
    updateVoter: (state, action: PayloadAction<Voter>) => {
      const updated = action.payload
      const index = state.voters.findIndex((h) => h.id === updated.id)
      if (index !== -1) {
        state.voters[index] = updated
      }
    },
    resetVoters: (state) => {
      state.voters = []
      state.votersPage = 1
    },
    setVotersPage: (state, action) => {
      state.votersPage = action.payload
    },
    // Households
    setHouseholds: (state, action: PayloadAction<Household[]>) => {
      state.households = action.payload
    },
    appendHouseholds: (state, action: PayloadAction<Household[]>) => {
      state.households = [...state.households, ...action.payload]
      state.householdsPage += 1
    },
    addHousehold: (state, action: PayloadAction<Household>) => {
      state.households = [action.payload, ...state.households]
    },
    updateHousehold: (state, action: PayloadAction<Household>) => {
      const updated = action.payload
      const index = state.households.findIndex((h) => h.id === updated.id)
      if (index !== -1) {
        state.households[index] = updated
      }
    },
    deleteHousehold: (state, action: PayloadAction<Household>) => {
      state.households = state.households.filter(
        (item) => item.id !== action.payload.id
      )
    },
    resetHouseholds: (state) => {
      state.households = []
      state.householdsPage = 1
    },
    setHouseholdsPage: (state, action) => {
      state.householdsPage = action.payload
    },
    // Residents
    setResidents: (state, action: PayloadAction<Resident[]>) => {
      state.residents = action.payload
    },
    appendResidents: (state, action: PayloadAction<Resident[]>) => {
      state.residents = [...state.residents, ...action.payload]
      state.residentsPage += 1
    },
    addResident: (state, action: PayloadAction<Resident>) => {
      state.residents = [action.payload, ...state.residents]
    },
    updateResident: (state, action: PayloadAction<Resident>) => {
      const updated = action.payload
      const index = state.residents.findIndex((h) => h.id === updated.id)
      if (index !== -1) {
        state.residents[index] = updated
      }
    },
    deleteResident: (state, action: PayloadAction<Resident>) => {
      state.residents = state.residents.filter(
        (item) => item.id !== action.payload.id
      )
    },
    resetResidents: (state) => {
      state.residents = []
      state.residentsPage = 1
    },
    setResidentsPage: (state, action) => {
      state.residentsPage = action.payload
    }
  }
})

export const {
  setVoters,
  appendVoters,
  updateVoter,
  resetVoters,
  setVotersPage,
  setHouseholds,
  appendHouseholds,
  updateHousehold,
  resetHouseholds,
  setHouseholdsPage,
  addHousehold,
  deleteHousehold,
  setResidents,
  appendResidents,
  addResident,
  updateResident,
  deleteResident,
  resetResidents,
  setResidentsPage
} = listSlice.actions

export default listSlice.reducer
