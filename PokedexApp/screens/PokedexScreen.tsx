import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { getPokemons, getPokemonDetails } from '../services/api';
import { Pokemon } from '../types/Pokemon';
import { PokemonCard } from '../components/PokemonCard';

export const PokedexScreen = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const list = await getPokemons(30); // primeiros 30 pokemons
        const details = await Promise.all(list.map(p => getPokemonDetails(p.url)));
        setPokemons(details);
      }
      catch(err) {
        console.error(err);
        setError('Falha ao carregar Pokémons. Verifique sua conexão.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = pokemons.filter(p => p.name.includes(search.toLowerCase()));
  const emptyState = () => {
  if (search.trim().length > 0) {
    return (
      <Text>Nenhum Pokémon encontrado para "{search}"</Text>
    );
  }

  return (
    <Text>Nenhum Pokémon para exibir no momento.</Text>);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <TextInput
        placeholder="Buscar pokémon..."
        style={styles.input}
        onChangeText={setSearch}
      />
      {isLoading ? (
        <ActivityIndicator size="large" />
      )
      : error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => <PokemonCard pokemon={item} />}
          ListEmptyComponent={emptyState}
        />
        
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
});