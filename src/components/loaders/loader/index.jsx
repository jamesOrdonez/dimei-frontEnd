import './.css';

export default function Loader() {
  return (
    <div
      style={{
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <div class="loaders" style={{ position: 'relative', right: '30px', color: 'gray' }} />{' '}
      <div class="loaders" style={{ position: 'absolute' }} />
    </div>
  );
}
