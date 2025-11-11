module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... các plugin khác của bạn (nếu có)
      
      // Thêm dòng này để React Native Reanimated hoạt động
      'react-native-reanimated/plugin',
    ],
  };
};