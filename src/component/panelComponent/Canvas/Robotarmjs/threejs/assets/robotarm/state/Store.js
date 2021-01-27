class Store {
    constructor(state, name, storeManager) {
      this.state = state
      this.name = name
      this.storeManager = storeManager
      this.actions = {}
      this.listeners = {}
      this.listenerId = 1
    }

    action(name, ...args) {
      if (this.actions.hasOwnProperty(name)) {
        console.warn(`action name in use: ${name}`)
      }

      let callback = args[0]

      // selector given
      if (args.length === 2) {
        const selector = args[0]
        const cb = args[1]
        callback = (state, data) => {
          const recursivelyAssignObjects = (object, selectedObj, newValue) => {
            if (object === selectedObj) {
              return newValue
            }
            for (const key in object) {
              if (object.hasOwnProperty(key)) {
                // key authors object book[0]
                if (object[key] === selectedObj) {
                  return Object.assign({}, object, {
                    [key]: newValue,
                  })
                }
                // key 0 object books
                if (Array.isArray(object[key]) || typeof (object[key]) === 'object') {
                  const newObject = recursivelyAssignObjects(object[key], selectedObj, newValue)
                  if (newObject) {
                    return Object.assign({}, object, {
                      [key]: newObject,
                    })
                  }
                }
              }
            }
            return false
          }
          const selectedObj = selector(state)

          if (typeof selectedObj !== 'object') {
            console.warn(`Action selector must select an object! (${selectedObj}) selected`)
          }

          const newState = recursivelyAssignObjects(state, selectedObj, cb(selectedObj, data))
          if (!newState) {
            console.warn('selector does not match any object', selector, state)
          }

          return newState
        }
      }

      this.actions[name] = callback
    }

    listen(...args) {
      let callback
      // selectros given
      if (args.length === 2) {
        const selects = args[0]
        const cb = args[1]
        const currentStates = []

        for (const select of selects) {
          currentStates.push(select(this.state))
        }

        const handleChange = (state) => {
          let changed = false
          for (const i in selects) {
            const newState = selects[i](state)
            if (newState !== currentStates[i]) {
              changed = true
              currentStates[i] = newState
            }
          }

          if (changed) {
            cb.apply(this, currentStates)
          }
        }

        callback = handleChange
        // execute cb once on init
        cb.apply(this, currentStates)
      } else {
        callback = args[0]
      }
      const id = this.listenerId++
      this.listeners[id] = callback
      // call once to init. Default state is already set
      callback(this.state)
      return id
    }

    unsubscribe(id) {
      if (this.listeners[id]) {
        delete this.listeners[id]
      } else {
        console.warn(`Could not find listener for id: ${id}`)
      }
    }

    dispatch(action, data) {
      this.storeManager.notify(action, data, this.name, this)
    }

    getState() {
      return this.state
    }

    getStore(storeName) {
      // console.log(`%cStore [${this.name}] requesting data from [${storeName}]`, 'font-weight:bold')
      return this.storeManager.getStore(storeName)
    }
}


export default Store;
  //const storeManager = new StoreManager();

//  return storeManager;
//}

// s.commit('CHANGE_CONTROL_MODE', mode, (state, data) => {
//     return [
//       ...state, {
//         controlMode: data,
//       },
//     ]
//   })
//   // global state (app state)
// GlobalDataDomain.setMode(mode)
//
// function onChange(store, select, onChange) {
//   let currentState;
//
//   function handleChange() {
//     let nextState = select(store.getState());
//     if (nextState !== currentState) {
//       currentState = nextState;
//       onChange(currentState);
//     }
//   }
//
//   let unsubscribe = store.subscribe(handleChange);
//   handleChange();
//   return unsubscribe;
// }
//
// store.onChange(store, [state, Module.getState(), Module.getClicked()](state) => {
//
// })
