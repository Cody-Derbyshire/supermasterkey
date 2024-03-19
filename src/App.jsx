import './App.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const apiUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL;
const apiKey = import.meta.env.VITE_REACT_APP_SUPABASE_KEY;

class SupabaseSingleton {
  constructor(apiUrl, apiKey) {
    if (!SupabaseSingleton.instance) {
      this.supabase = createClient(apiUrl, apiKey);
      SupabaseSingleton.instance = this;
    }

    return SupabaseSingleton.instance;
  }

  getInstance() {
    return this.supabase;
  }
}

const supabaseSingleton = new SupabaseSingleton(apiUrl, apiKey);
const supabase = supabaseSingleton.getInstance();

function App() {
  const [information, setInformation] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    getInformation();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const TooltipForm = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      username: '',
      password: '',
      note: '',
    });

    const toggleForm = () => {
      setIsVisible(!isVisible);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const { error } = await supabase.from('information').insert([formData]);

        if (error) {
          throw error;
        }

        console.log('New information added successfully.');
        setFormData({ name: '', username: '', password: '', note: '' }); // Clear form fields after submission
        getInformation(); // Refresh information after adding new entry
      } catch (error) {
        console.error('Error adding new information:', error.message);
      }
    };

    return (
      <div className='tooltip'>
        <button className='tooltip-toggle' onClick={toggleForm}>
          +
        </button>
        {isVisible && (
          <div className='tooltip-content'>
            <form onSubmit={handleSubmit}>
              <label htmlFor='name'>Name:</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
              />
              <label htmlFor='username'>Username:</label>
              <input
                type='text'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleChange}
              />
              <label htmlFor='password'>Password:</label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
              />
              <label htmlFor='note'>Note:</label>
              <input
                type='text'
                id='note'
                name='note'
                value={formData.note}
                onChange={handleChange}
              />
              <button type='submit'>Submit</button>
            </form>
          </div>
        )}
      </div>
    );
  };

  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut(); // Sign out the current user

      if (error) {
        throw error;
      }

      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const getInformation = async () => {
    try {
      const { data, error } = await supabase.from('information').select();

      if (error) {
        throw error;
      }

      setInformation(data || []);
    } catch (error) {
      console.error('Error fetching information:', error.message);
    }
  };

  /* console.log(supabase.auth.getSession()); */

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('information')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('Information deleted successfully.');
      getInformation(); // Refresh information after deleting entry
    } catch (error) {
      console.error('Error deleting information:', error.message);
    }
  };

  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme='dark'
        providers={['google', 'github']}
      />
    );
  } else if (
    session.user.id == 'de3061de-b958-49e3-8464-b4a5bfa067bd' ||
    session.user.email == 'derbyshire@outlook.co.nz'
  ) {
    return (
      <>
        <div></div>
        <h2 className='greeting'>Hi Cody!</h2>

        {information.map((info) => (
          <div key={info.id} className='info-entry'>
            <h3>{info.name}</h3>
            <button onClick={() => handleDelete(info.id)}>x</button>
          </div>
        ))}

        <TooltipForm />

        <button onClick={signOutUser}>log out</button>
      </>
    );
  } else {
    return <h2>come back when you're allowed!</h2>;
  }
}

export default App;
