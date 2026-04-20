import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { getPokemons, getPokemonDetails } from '../services/api';
import { Pokemon } from '../types/Pokemon';
import { PokemonCard } from '../components/PokemonCard';

export const PokedexScreen = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const listLimit = 30;

  const fetchData = async (currentOffset: number) => {
    try {
      if (currentOffset === 0) {setIsLoading(true);}
      else {setIsLoadingMore(true);}

      const list = await getPokemons(listLimit, currentOffset);
      const details = await Promise.all(list.map(p => getPokemonDetails(p.url)));
      setPokemons(prev => currentOffset === 0 ? details : [...prev, ...details]);
    }
    catch(err) {
      console.error(err);
      setError('Falha ao carregar Pokémons. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
    
  useEffect(() => {fetchData(0);}, []);

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

  const loadMorePokemons = () => {
    if (isLoadingMore || search.trim().length > 0) {return};

    const nextOffset = offset + listLimit;
    setOffset(nextOffset);
    fetchData(nextOffset);
  };
  const renderFooter = () => {
    if (!isLoadingMore) {return null};
    return (
      <ActivityIndicator />
    );
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
          onEndReached={loadMorePokemons}
          ListFooterComponent={renderFooter}
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