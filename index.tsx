import React from 'react'
import { Dimensions, Platform, ViewStyle, View } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

type Props = {
  style?: ViewStyle
  defaultValue?: string
  options?: any
  onChange?: (html: string) => void
}

const Quill = React.forwardRef((props: Props, ref) => {

  const [height, $height] = React.useState(90);

  const webviewRef = React.useRef(null);

  const options = JSON.stringify({
    placeholder: '请输入...',
    modules: {
      toolbar: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], ['image', 'code-block']],
    },
    ...props.options,
    theme: 'snow',
  })
  const injectedJavaScriptBeforeContentLoaded = `window.options=${options}`
  const injectedJavaScript = `document.querySelector('#editor').children[0].innerHTML="${props.defaultValue}";
  `

  const onMessage = (e: WebViewMessageEvent) => {
    const data = JSON.parse(e.nativeEvent.data)
    if (data.type === 'onChange') {
      props.onChange(data.message)

      if (data.height) {
        if (data.height <= 200 && data.height > 90) {
          $height(data.height)
        }
      }
    }
  }

  React.useImperativeHandle(ref, () => ({
    clearText: () => {
      if (webviewRef.current) {  
        webviewRef.current.postMessage(JSON.stringify({ type: 'clear' }));
        $height(90)
      }
    },
    setText: (value) => {
      if (webviewRef.current) {
        webviewRef.current.postMessage(JSON.stringify({ type: 'set', value }));
      }
    },
    blur: () => {
      if (webviewRef.current) {
        webviewRef.current.postMessage(JSON.stringify({ type: 'blur' }));
      }
    },
    enable: (status) => {
      if (webviewRef.current) {
        if (status) {
          webviewRef.current.postMessage(JSON.stringify({ type: 'enable' }));
        } else {
          webviewRef.current.postMessage(JSON.stringify({ type: 'disable' }));
        }
        
      }
    }
  }));


 
  return (
    <View style={{ height }}>
      <WebView
        onMessage={onMessage}
        ref={webviewRef}
        source={Platform.OS === 'ios' ? require('./assets/quill.html') : { uri: 'file:///android_asset/quill.html' }}
        javaScriptEnabled
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        injectedJavaScript={injectedJavaScript}
        bounces={false}
        scrollEnabled={false}
        hideKeyboardAccessoryView
        automaticallyAdjustContentInsets={false}
        style={{ width: Dimensions.get('window').width }}
      />
    </View>
  )
});

Quill.defaultProps = {
  style: {},
  defaultValue: '',
  onChange: () => {},
  options: {},
}

export default  Quill
