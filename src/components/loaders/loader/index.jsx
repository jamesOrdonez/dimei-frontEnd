import './styles.css';

export default function Loader() {
  return (
    <div
      style={{
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="loaders" style={{ position: 'relative', right: '30px', color: '#c5c5c5' }} />
      <div className="loaders" style={{ position: 'absolute' }} />
    </div>
  );
}
