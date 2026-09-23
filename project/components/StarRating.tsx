import React, { useCallback } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/lib/theme';

type StarRatingProps = {
  rating: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
  style?: ViewStyle;
};

const STAR_GAP = 2;

export function StarRating({
  rating,
  size = 24,
  editable = false,
  onRatingChange,
  color = Colors.accent,
  style,
}: StarRatingProps) {
  const handlePress = useCallback(
    (starIndex: number, half: boolean) => {
      if (!editable || !onRatingChange) return;

      const newRating = half
        ? starIndex - 0.5
        : starIndex;

      onRatingChange(newRating);
    },
    [editable, onRatingChange],
  );

  const renderStar = (starIndex: number) => {
    const filled = rating >= starIndex;
    const half = !filled && rating >= starIndex - 0.5;

    const starContent = half ? (
      <View
        style={[
          styles.halfStarContainer,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <Star
          size={size}
          color={Colors.neutral[700]}
          strokeWidth={1.5}
          fill="transparent"
        />

        <View
          style={[
            styles.halfStarClip,
            {
              width: size / 2,
              height: size,
            },
          ]}
        >
          <Star
            size={size}
            color={color}
            strokeWidth={0}
            fill={color}
          />
        </View>
      </View>
    ) : (
      <Star
        size={size}
        color={filled ? color : Colors.neutral[700]}
        strokeWidth={filled ? 0 : 1.5}
        fill={filled ? color : 'transparent'}
      />
    );

    if (!editable) {
      return (
        <View
          key={starIndex}
          style={[
            styles.starWrapper,
            {
              width: size,
              height: size,
            },
          ]}
        >
          {starContent}
        </View>
      );
    }

    return (
      <View
        key={starIndex}
        style={[
          styles.starWrapper,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <Pressable
          style={[
            styles.touchArea,
            {
              width: size / 2,
              height: size,
              left: 0,
            },
          ]}
          onPress={() => handlePress(starIndex, true)}
        />

        <Pressable
          style={[
            styles.touchArea,
            {
              width: size / 2,
              height: size,
              right: 0,
            },
          ]}
          onPress={() => handlePress(starIndex, false)}
        />

        {starContent}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  starWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: STAR_GAP,
  },

  touchArea: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },

  halfStarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  halfStarClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});

